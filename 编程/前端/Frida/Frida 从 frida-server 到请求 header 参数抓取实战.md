# Frida 从 frida-server 到请求 header 参数抓取实战

> 目标：用 Frida 直接在 Android App 进程内抓请求 URL、method、headers、body，以及更上层的明文业务参数。

这份笔记基于一次 WhatsApp 注册请求的实测过程整理。最终 Frida 已经抓到：

```text
明文业务参数：
RegisterPhone.A0z args arg0=852 | arg1=51234567 | arg2=30

网络请求：
POST https://v.whatsapp.net/v2/exist
POST https://185.60.219.41/v2/exist
POST https://y9yrsygcg6.execute-api.us-east-1.amazonaws.com/s/s?_=/v2/exist&

HTTP body：
ENC=<加密内容>&H=<签名>

核心 headers：
User-Agent: WhatsApp/2.26.23.75 Android/15 Device/OPPO-PJV110
WaMsysRequest: 1
Authorization: <Android Keystore attestation 证书串>
request_token: <UUID>
Content-Type: application/x-www-form-urlencoded
Content-Length: 2635/2639 附近
```

## 1. Frida 的实现原理

Frida 的链路可以拆成 4 层：

```text
电脑上的 frida CLI
    |
    | 通过 USB/adb forward/TCP 连接
    v
手机上的 frida-server
    |
    | 注入 frida-agent 到目标 App 进程
    v
目标 App 进程内的 Frida JS Runtime
    |
    | Java.perform / Interceptor.attach / 方法替换
    v
读取或改写目标 App 的函数参数、返回值、字段、网络请求
```

### 1.1 frida-server 是什么

`frida-server` 是跑在 Android 设备上的服务端。电脑上的 `frida` 命令不是直接读 App 内存，而是把脚本发给 `frida-server`，由 `frida-server` 注入目标 App。

普通生产 Android 机上，`frida-server` 通常需要 root 权限才能 attach 到别的 App。没有 root 的替代方案是 Frida Gadget，即把 Frida 动态库打进 APK 里，但这需要重打包目标 APK。

### 1.2 Frida 脚本做了什么

Frida 脚本常见两类：

```text
观察型 hook：
读取 URL、headers、body、业务参数，不改变 App 行为。

绕过型 hook：
改写证书校验、SSL pinning、返回值、异常逻辑，让 App 继续执行。
```

这次真正拿到请求信息，靠的是观察型 hook：

```text
RegisterPhone.A0z(...)
com.facebook.msys.mci.NetworkUtils.A00(UrlRequest)
HttpsURLConnection.setRequestProperty(...)
```

它们分别对应：

```text
业务层明文参数 -> App 网络封装层 -> HTTP header 设置层
```

### 1.3 为什么抓包工具看到的 body 还是 ENC

这里要区分两层加密：

```text
业务明文参数：
cc=852, phone=51234567

App 内部加密/签名后：
ENC=<...>&H=<...>

再进入 HTTPS/TLS：
外部网络抓包只能看到 TLS 加密流量
```

SSL pinning 绕过只能解决 HTTPS 证书校验问题。它不能自动解开 App 自己的 `ENC/H` 业务加密。

所以正确理解是：

```text
证书 pinning 绕过：让代理工具更容易看 HTTPS 明文。
Frida 请求 hook：直接在 App 进程内看请求构造过程。
业务参数 hook：在 ENC 生成前找到 cc/phone 这类明文。
```

## 2. 你发的脚本和本次脚本是什么关系

你发来的脚本是一个通用 SSL pinning 绕过脚本。它 hook 的内容包括：

```text
SSLContext.init
X509TrustManager
HostnameVerifier
okhttp3.CertificatePinner
com.squareup.okhttp.CertificatePinner
WebViewClient.onReceivedSslError
HttpsURLConnection
TrustManagerImpl.verifyChain
OpenSSLSocketImpl.verifyCertificateChain
TrustKit
CronetEngine.Builder.addPublicKeyPins
```

它的目标是：

```text
不要因为证书不被信任或 pinning 校验失败而中断 HTTPS 请求。
```

本次实际跑通的脚本目标是：

```text
读取 App 里的请求 URL、method、headers、body 和业务参数。
```

两者关系不是包含关系，而是交集 + 可组合关系：

| 维度 | 你发的 SSL pinning 脚本 | 本次请求日志脚本 |
|---|---|---|
| 是否使用 Frida | 是 | 是 |
| 主要目的 | 绕过证书校验 / SSL pinning | 抓 URL/header/body/业务参数 |
| 是否直接打印请求 body | 基本不打印 | 打印 |
| 是否直接打印 header | 基本不打印 | 打印 |
| 是否能解决 App 自定义 ENC 加密 | 不能 | 只能通过继续找 ENC 前的业务层 |
| 和代理工具关系 | 常用于让代理能解 HTTPS | 不依赖代理工具 |
| 风险 | 可能改行为但通常不大量打日志 | hook 太宽会崩，必须收窄 |

更准确地说：

```text
你的脚本 = TLS/pinning 绕过类 hook
本次脚本 = 请求观察类 hook

完整抓包方案 = TLS 绕过 hook + 请求观察 hook + 业务参数 hook
```

如果只想知道 URL、header、body，优先用请求观察 hook。  
如果 App 因证书 pinning 导致代理不可用，再加 SSL pinning 绕过 hook。  
如果 body 里已经是 `ENC/H`，还要继续往业务层或加密入口前找明文。

## 3. 从零开始操作流程

下面以 Windows PowerShell 为例。

### 3.1 准备 adb 路径和设备序列号

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$serial = "10.0.0.141:31013"

& $adb devices
& $adb -s $serial shell getprop ro.product.cpu.abi
```

常见 ABI：

```text
arm64-v8a -> 下载 android-arm64 frida-server
armeabi-v7a -> 下载 android-arm frida-server
x86_64 -> 下载 android-x86_64 frida-server
```

### 3.2 确认电脑 Frida 版本

```powershell
$frida = "$env:APPDATA\Python\Python312\Scripts\frida.exe"
& $frida --version
```

Frida CLI 和手机上的 `frida-server` 版本必须一致，例如都为：

```text
17.10.1
```

### 3.3 推送 frida-server 到手机

假设你下载的是：

```text
frida-server-17.10.1-android-arm64
```

执行：

```powershell
& $adb -s $serial push .\frida-server-17.10.1-android-arm64 /data/local/tmp/frida-server
& $adb -s $serial shell su -c "chmod 755 /data/local/tmp/frida-server"
```

验证文件存在：

```powershell
& $adb -s $serial shell ls -l /data/local/tmp/frida-server
```

### 3.4 启动 frida-server

```powershell
& $adb -s $serial shell su -c "pkill -f frida-server"
& $adb -s $serial shell su -c "/data/local/tmp/frida-server >/dev/null 2>&1 &"
```

确认进程：

```powershell
& $adb -s $serial shell ps -A | Select-String frida
```

如果用 adb forward：

```powershell
& $adb -s $serial forward tcp:27042 tcp:27042
```

然后电脑连接：

```powershell
& $frida -H 127.0.0.1:27042 --version
```

如果是 USB 直连，也可以用：

```powershell
frida-ps -U
```

如果是当前这种转发方式，用：

```powershell
frida-ps -H 127.0.0.1:27042
```

### 3.5 找目标进程

以 WhatsApp 为例：

```powershell
& $adb -s $serial shell pidof com.whatsapp
frida-ps -H 127.0.0.1:27042 | Select-String whatsapp
```

如果 App 已经打开，优先 attach 当前 PID：

```powershell
frida -H 127.0.0.1:27042 -p <PID> -l .\script.js -o .\frida.log
```

如果 App 还没启动，可以 spawn：

```powershell
frida -H 127.0.0.1:27042 -f com.whatsapp -l .\script.js -o .\frida.log
```

Frida 17 当前帮助里是 `--pause`，默认不需要旧教程里的 `--no-pause`。

## 4. 先做 smoke test

先不要上复杂脚本。保存为 `smoke-log.js`：

```javascript
console.log("[*] smoke script loaded");

Java.perform(function () {
  console.log("[*] Java runtime ready");
});
```

运行：

```powershell
frida -H 127.0.0.1:27042 -p <PID> -l .\smoke-log.js -o .\smoke.log
```

看到下面输出才继续：

```text
[*] smoke script loaded
[*] Java runtime ready
```

## 5. 请求信息应该 hook 哪一层

优先级从低风险到高风险：

```text
1. App 自己的网络封装类
2. OkHttp / HttpURLConnection / Cronet 的请求构造层
3. 业务层方法，比如注册页提交方法
4. 加密入口，例如 Cipher/Mac/native 函数
```

不要一上来 hook 全局 `StringBuilder.toString()`、`Cipher.doFinal()`、`HashMap.put()`。这些方法调用太频繁，容易卡死或崩溃。

这次就出现过一次：全局 plaintext trace 太宽，WhatsApp 被 Frida agent 打崩。后面改成窄 hook 才稳定。

## 6. WhatsApp 本次实际有效的 hook 点

### 6.1 业务层明文参数

注册页类：

```text
com.whatsapp.registration.app.phonenumberentry.RegisterPhone
```

有效方法：

```text
RegisterPhone.A0z(String, String, int)
```

实际日志：

```text
RegisterPhone.A0z args arg0=852 | arg1=51234567 | arg2=30
```

解释：

```text
arg0 = 国家/地区码
arg1 = 手机号
arg2 = 这次流程里的数值参数，实测为 30
```

### 6.2 网络层 URL/body

WhatsApp 走了 Meta msys 网络层：

```text
com.facebook.msys.mci.NetworkUtils.A00(com.facebook.msys.mci.UrlRequest)
```

`UrlRequest` 有这些方法：

```text
getUrl()
getHttpMethod()
getHttpBody()
getHttpHeaders()
```

实际日志：

```text
url=https://y9yrsygcg6.execute-api.us-east-1.amazonaws.com/s/s?_=/v2/exist&
method=POST
body.length=2639
body.utf8=ENC=<...>&H=<...>
```

### 6.3 header 层

header 通过 `HttpsURLConnection.setRequestProperty(...)` 抓到。

实际关键 header：

```text
User-Agent: WhatsApp/2.26.23.75 Android/15 Device/OPPO-PJV110
WaMsysRequest: 1
Authorization: <Android Keystore attestation 证书串>
request_token: 4BBA68FA-723E-47B6-BEDB-BD5FEAD29623
Content-Length: 2635
Content-Type: application/x-www-form-urlencoded
```

fallback 代理路径还会看到：

```text
X-Forwarded-Host: v.whatsapp.net
Host: y9yrsygcg6.execute-api.us-east-1.amazonaws.com
```

## 7. 完整脚本：业务参数 + 网络 body

保存为 `whatsapp-register-and-network.js`。

```javascript
console.log("[*] whatsapp-register-and-network loaded");

Java.perform(function () {
  var Thread = Java.use("java.lang.Thread");
  var JavaString = Java.use("java.lang.String");
  var inHook = false;

  function log(prefix, message) {
    console.log("[" + prefix + "] " + message);
  }

  function safe(value) {
    try {
      if (value === null || value === undefined) {
        return String(value);
      }
      return value.toString();
    } catch (error) {
      return "<toString failed: " + error.message + ">";
    }
  }

  function stackSnippet() {
    try {
      var stack = Thread.currentThread().getStackTrace();
      var lines = [];
      for (var i = 0; i < stack.length && i < 14; i++) {
        var line = safe(stack[i]);
        if (line.indexOf("frida") === -1 && line.indexOf("java.lang.Thread.getStackTrace") === -1) {
          lines.push(line);
        }
      }
      return lines.join(" <- ");
    } catch (error) {
      return "<stack failed: " + error.message + ">";
    }
  }

  function hookRegisterPhone() {
    try {
      var RegisterPhone = Java.use("com.whatsapp.registration.app.phonenumberentry.RegisterPhone");
      ["A0z", "A15", "A5K", "A5N", "A5h"].forEach(function (methodName) {
        if (!(methodName in RegisterPhone)) {
          log("register", "missing " + methodName);
          return;
        }
        RegisterPhone[methodName].overloads.forEach(function (overload) {
          var signature = overload.returnType.name + " RegisterPhone." + methodName + "(" + overload.argumentTypes.map(function (type) {
            return type.name;
          }).join(",") + ")";
          overload.implementation = function () {
            if (!inHook) {
              inHook = true;
              try {
                var parts = [];
                for (var i = 0; i < arguments.length; i++) {
                  parts.push("arg" + i + "=" + safe(arguments[i]));
                }
                log("register", signature + " args " + parts.join(" | "));
                log("register", signature + " stack " + stackSnippet());
              } finally {
                inHook = false;
              }
            }
            var result = overload.apply(this, arguments);
            if (!inHook) {
              inHook = true;
              try {
                log("register", signature + " result=" + safe(result));
              } finally {
                inHook = false;
              }
            }
            return result;
          };
          log("register", "hooked " + signature);
        });
      });
    } catch (error) {
      log("register", "hook failed " + error.message);
    }
  }

  function bytesToUtf8(bytes, maxBytes) {
    if (bytes === null || bytes === undefined) {
      return "<null>";
    }
    try {
      var count = Math.min(bytes.length, maxBytes);
      var values = [];
      for (var i = 0; i < count; i++) {
        values.push(bytes[i]);
      }
      var slice = Java.array("byte", values);
      var text = JavaString.$new(slice, "UTF-8").toString();
      if (bytes.length > maxBytes) {
        text += "...(" + bytes.length + " bytes)";
      }
      return text.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
    } catch (error) {
      return "<utf8 failed: " + error.message + ">";
    }
  }

  function shouldLogUrl(url) {
    return url.indexOf("/v2/") !== -1 ||
      url.indexOf("v.whatsapp.net") !== -1 ||
      url.indexOf("execute-api") !== -1 ||
      url.indexOf("cloudfunctions.net") !== -1;
  }

  function hookNetwork() {
    try {
      var NetworkUtils = Java.use("com.facebook.msys.mci.NetworkUtils");
      var overload = NetworkUtils.A00.overload("com.facebook.msys.mci.UrlRequest");
      overload.implementation = function (request) {
        var url = "<unknown>";
        try {
          url = safe(request.getUrl());
        } catch (error) {
          url = "<getUrl failed: " + error.message + ">";
        }
        if (shouldLogUrl(url)) {
          log("msys-net", "url=" + url);
          try {
            log("msys-net", "method=" + safe(request.getHttpMethod()));
          } catch (methodError) {
            log("msys-net", "method=<failed: " + methodError.message + ">");
          }
          try {
            var body = request.getHttpBody();
            if (body === null || body === undefined) {
              log("msys-net", "body=<null>");
            } else {
              log("msys-net", "body.length=" + body.length);
              log("msys-net", "body.utf8=" + bytesToUtf8(body, 12000));
            }
          } catch (bodyError) {
            log("msys-net", "body=<failed: " + bodyError.message + ">");
          }
        }
        return overload.call(this, request);
      };
      log("msys-net", "hooked com.facebook.msys.mci.NetworkUtils.A00");
    } catch (error) {
      log("msys-net", "hook failed " + error.message);
    }
  }

  hookRegisterPhone();
  hookNetwork();
});
```

运行：

```powershell
$pidText = (& $adb -s $serial shell pidof com.whatsapp).Trim()
frida -H 127.0.0.1:27042 -p $pidText -l .\whatsapp-register-and-network.js -o .\frida-whatsapp-register-and-network.log
```

然后在手机上触发注册动作。

应该看到：

```text
[register] RegisterPhone.A0z(...) args arg0=852 | arg1=51234567 | arg2=30
[msys-net] url=https://.../v2/exist
[msys-net] method=POST
[msys-net] body.length=2639
[msys-net] body.utf8=ENC=...&H=...
```

## 8. 完整脚本：HTTP header 捕获

保存为 `huc-header-log.js`。

```javascript
console.log("[*] huc-header-log loaded");

Java.perform(function () {
  function safe(value) {
    try {
      if (value === null || value === undefined) {
        return String(value);
      }
      return value.toString();
    } catch (error) {
      return "<toString failed: " + error.message + ">";
    }
  }

  function shouldLog(url) {
    return url.indexOf("/v2/") !== -1 ||
      url.indexOf("v.whatsapp.net") !== -1 ||
      url.indexOf("execute-api") !== -1 ||
      url.indexOf("cloudfunctions.net") !== -1;
  }

  function hookClass(className) {
    try {
      var klass = Java.use(className);

      if ("setRequestMethod" in klass) {
        klass.setRequestMethod.overload("java.lang.String").implementation = function (method) {
          var url = safe(this.getURL());
          if (shouldLog(url)) {
            console.log("[huc] " + className + ".setRequestMethod method=" + method + " url=" + url);
          }
          return this.setRequestMethod(method);
        };
      }

      if ("setRequestProperty" in klass) {
        klass.setRequestProperty.overload("java.lang.String", "java.lang.String").implementation = function (key, value) {
          var url = safe(this.getURL());
          if (shouldLog(url)) {
            console.log("[huc] " + className + ".setRequestProperty " + key + ": " + value + " url=" + url);
          }
          return this.setRequestProperty(key, value);
        };
      }

      if ("addRequestProperty" in klass) {
        klass.addRequestProperty.overload("java.lang.String", "java.lang.String").implementation = function (key, value) {
          var url = safe(this.getURL());
          if (shouldLog(url)) {
            console.log("[huc] " + className + ".addRequestProperty " + key + ": " + value + " url=" + url);
          }
          return this.addRequestProperty(key, value);
        };
      }

      console.log("[huc] hooked " + className);
    } catch (error) {
      console.log("[huc] hook failed " + className + ": " + error.message);
    }
  }

  [
    "com.android.okhttp.internal.huc.HttpsURLConnectionImpl",
    "com.android.okhttp.internal.huc.DelegatingHttpsURLConnection",
    "com.android.okhttp.internal.huc.HttpURLConnectionImpl",
    "javax.net.ssl.HttpsURLConnection",
    "java.net.HttpURLConnection"
  ].forEach(hookClass);
});
```

运行：

```powershell
$pidText = (& $adb -s $serial shell pidof com.whatsapp).Trim()
frida -H 127.0.0.1:27042 -p $pidText -l .\huc-header-log.js -o .\huc-header.log
```

期望看到：

```text
[huc] ...setRequestMethod method=POST url=https://v.whatsapp.net/v2/exist
[huc] ...setRequestProperty User-Agent: WhatsApp/2.26.23.75 Android/15 Device/OPPO-PJV110
[huc] ...setRequestProperty WaMsysRequest: 1
[huc] ...setRequestProperty Authorization: <...>
[huc] ...setRequestProperty request_token: <UUID>
[huc] ...setRequestProperty Content-Type: application/x-www-form-urlencoded
[huc] ...setRequestProperty Content-Length: 2635
```

## 9. 怎么判断抓到的是哪一层

看到这些，说明抓到的是业务层：

```text
cc=852
phone=51234567
countryCode
phoneNumber
RegisterPhone
```

看到这些，说明抓到的是 App 网络封装层：

```text
UrlRequest
NetworkUtils
method=POST
url=https://...
body.length=...
```

看到这些，说明抓到的是 HTTP 头设置层：

```text
setRequestProperty
User-Agent
Authorization
Content-Type
Content-Length
```

看到这些，说明已经进入 App 自定义加密后的 body：

```text
ENC=...
H=...
```

这时 SSL pinning 绕过不能把 `ENC` 变成明文。要继续往前找：

```text
构造 ENC 的 Java 方法
构造 ENC 的 native 方法
加密函数调用前的 byte[]
业务参数对象
```

## 10. 常见问题

### 10.1 `frida -U` 看不到设备

如果设备不是 USB 直连，或者是 VMOS/云手机/adb TCP 场景，不要用 `-U`。用：

```powershell
frida-ps -H 127.0.0.1:27042
frida -H 127.0.0.1:27042 -p <PID> -l .\script.js
```

### 10.2 `unable to find process with pid`

PID 变了，重新查：

```powershell
& $adb -s $serial shell pidof com.whatsapp
```

再 attach 新 PID。

### 10.3 `Failed to spawn: unexpectedly timed out`

有时 App 实际已经启动，只是 Frida spawn 等待超时。处理方式：

```powershell
& $adb -s $serial shell pidof com.whatsapp
frida -H 127.0.0.1:27042 -p <新 PID> -l .\script.js
```

### 10.4 App 被 Frida hook 崩了

通常是 hook 太宽，比如：

```text
StringBuilder.toString
HashMap.put
Cipher.doFinal
Mac.doFinal
```

处理方式：

```text
1. 停掉 Frida
2. 重启 App
3. 只 hook 一个具体类或一个具体方法
4. 先打印参数，不改返回值
```

### 10.5 是否需要 Magisk

如果你使用 `frida-server` attach 普通 App，通常需要 root 权限。Magisk 是常见 root 方案。

LSPosed 和 Frida 不是一回事：

```text
LSPosed：模块框架，zygote 注入，适合长期模块化 hook。
Frida：动态调试注入，适合临时分析、快速验证。
Magisk：提供 root/系统修改能力，frida-server 常依赖它获得权限。
```

### 10.6 `pip install contextvars` 什么时候需要

Frida CLI 本身一般不需要 `contextvars`。只有某些旧 Python 工具链或旧脚本报：

```text
ModuleNotFoundError: No module named 'contextvars'
```

才执行：

```powershell
pip install contextvars
```

Python 3.7+ 通常内置相关能力，不一定需要安装。

## 11. 一套稳定的排查顺序

每次分析新 App，按这个顺序：

```text
1. 确认 frida CLI 和 frida-server 版本一致
2. 确认 frida-server 在手机运行
3. smoke test 验证 Java.perform 可执行
4. hook HTTP header 层，看有没有 URL/header
5. hook App 网络封装层，看 body
6. 如果 body 是 ENC/H，hook 业务层，找明文参数
7. 如果代理工具需要 HTTPS 明文，再加 SSL pinning 绕过脚本
8. 如果 App 崩溃，撤掉全局 hook，缩小到具体类和具体方法
```

本次 WhatsApp 的有效结论就是：

```text
Frida 可以获取 URL、method、headers、加密后的 body。
Frida 也可以在更上层获取明文业务参数。
但网络层 body 已经是 App 自定义 ENC/H，不是普通表单明文。
```
