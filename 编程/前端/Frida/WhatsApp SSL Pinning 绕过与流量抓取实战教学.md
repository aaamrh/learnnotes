## 目录
1. [前置知识：什么是 SSL Pinning](#1-前置知识什么是-ssl-pinning)
2. [为什么 Charles 抓不到 WhatsApp](#2-为什么-charles-抓不到-whatsapp)
3. [WhatsApp SSL Pinning 逆向分析](#3-whatsapp-ssl-pinning-逆向分析)
4. [环境准备](#4-环境准备)
5. [实战步骤](#5-实战步骤)
6. [Frida 脚本详解](#6-frida-脚本详解)
7. [常见问题排查](#7-常见问题排查)

---

## 1. 前置知识：什么是 SSL Pinning

### 1.1 正常 HTTPS 抓包原理

当你用 Charles/Fiddler/mitmproxy 抓 HTTPS 包时，工作原理是 **中间人攻击（MITM）**：

```
App ──TLS──▶ Charles ──TLS──▶ 服务器
         ▲
    Charles 伪装成服务器，
    用自己的 CA 证书签发伪造证书给 App
```

正常情况下，App 只信任系统内置的 CA 证书。你把 Charles 的根证书装到手机"受信任的用户证书"里，App 就会信任 Charles 签发的伪造证书，从而 Charles 能解密流量。

### 1.2 SSL Pinning（证书锁定）

SSL Pinning 是指 App 在代码里**硬编码**了应该信任的证书特征（公钥哈希或证书指纹），不管系统信任什么证书，只看是不是自己"锁定"的那个。

```
正常流程：系统信任链 →  系统里有 Charles 证书 → ✅ 信任
Pinning： 硬编码白名单 → Charles 哈希不在列表 → ❌ 拒绝
```

Android 有两种 SSL Pinning：

| 类型 | 实现方式 | 绕过难度 |
|------|---------|---------|
| **Android 原生 pinning** | `network_security_config.xml` 里的 `<pin-set>` | 容易（Root + TrustMeAlready 或 `overridePins`） |
| **程序化 pinning** | 代码里自定义 TrustManager，检查证书哈希白名单 | 难（需要 Frida/Xposed/APK patch） |
| **自定义 TLS 协议栈** | 完全不用系统 SSL，自己实现 TLS 握手 | 最难（要逆向协议 + 找准 hook 点） |

WhatsApp 三样全占。

---

## 2. 为什么 Charles 抓不到 WhatsApp

即使你在手机上装了 Charles 证书，WhatsApp 依然有三种方式拒绝 Charles 的伪造证书：

### 2.1 问题一：network_security_config.xml 只管系统 SSL

```xml
<!-- WhatsApp v2.26.24.70 的网络安全配置 -->
<base-config cleartextTrafficPermitted="true">
    <trust-anchors>
        <certificates src="system"/>
        <certificates overridePins="true" src="user"/>   <!-- 允许用户证书覆盖系统 pins -->
    </trust-anchors>
</base-config>
```

虽然写了 `overridePins="true"`，但这**只对使用 Android 默认 SSL 栈的代码生效**。WhatsApp 根本不走这个栈。

### 2.2 问题二：程序化证书锁定（18 个硬编码 SHA-256 哈希）

WhatsApp 的 `X.Ao5` 类（核心 TrustManager）在构造函数里硬编码了 18 个公钥 SHA-256 哈希：

```java
// 对应源码：d:\learn\myapp-jadx\sources\X\AbstractC24158AoB.java
public static final String[] A00 = {
    "grX4Ta9HpZx6tSHkmCrvpApTQGo67CYDnvprLg5yRME=",
    "58qRu/uxh4gFezqAcERupSkRYBlBAvfcw7mEjGPLnNU=",
    "x4QzPSC810K5/cMjb05Qm4k3Bw5zBn4lTdO/nEW/Td4=",
    // ... 共 18 个
};
```

校验逻辑（`X.Ao5.java` 第 141 行）：

```java
public void A01(List list) throws CertificateException {
    // 有效期到 2027年6月
    if (System.currentTimeMillis() <= 1813258823000L) {
        for (证书 in 证书链) {
            SHA256(证书.公钥) == 白名单中的某个哈希 ? return;  // ✅ 通过
        }
        throw CertificateException("pinning error");   // ❌ 拒绝
    }
}
```

### 2.3 问题三：自定义 TLS 1.3 协议栈 + 硬编码根证书

WhatsApp 消息协议通信不走 HTTP，而是走**自己实现的 TLS 1.3 协议栈**（`X.AbstractC50328Mma`，558 行代码），使用原始 TCP Socket。

关键文件：`X.N0Q.java`（SSLSocketFactory）

```java
// 硬编码的信任根证书列表，只有 ValiCert 和 DigiCert
public static final TrustManager[] A0C = {new C29419D4p(2)};

// C29419D4p($t=2) 的 getAcceptedIssuers() 返回
public X509Certificate[] getAcceptedIssuers() {
    switch (this.$t) {
        case 2: return N0Q.A0B;   // ← 只认这两个硬编码的根证书
    }
}
```

这意味着：**即使你把 Charles 证书刻进 Android 系统信任库里，WhatsApp 的 TLS 1.3 栈也只看它自己硬编码的两个 CA（ValiCert 和 DigiCert Global Root CA）。**

### 2.4 总结：三层防御

```
┌─────────────────────────────────────────┐
│ Layer 1: Android native pinning         │  ← overridePins="true" 可绕过
│ (network_security_config.xml)           │
├─────────────────────────────────────────┤
│ Layer 2: 程序化证书锁定                 │  ← Frida hook Ao5.A01(List)
│ (18 SHA-256 hardcoded pins)             │
├─────────────────────────────────────────┤
│ Layer 3: 自定义 TLS 1.3 + 硬编码根证书  │  ← Frida hook D4p.checkServerTrusted()
│ (ValiCert + DigiCert only)              │
└─────────────────────────────────────────┘
```

---

## 3. WhatsApp SSL Pinning 逆向分析

### 3.1 工具链

| 工具 | 用途 |
|------|------|
| **JADX** | 反编译 APK 为 Java 源码 |
| **Frida** | 动态注入，运行时 hook 方法 |
| **ADB** | 连接 Android 设备/模拟器 |
| **Charles** | HTTPS 抓包代理 |

### 3.2 逆向关键类

APK: WhatsApp v2.26.24.70  
包名: `com.whatsapp`

```
证书锁定核心链：
CertificateVerifier (Facebook 层)
    ↓
B4T → Ao7 → Ao6 → Ao5.A01(List)  ← 18个硬编码哈希白名单校验
    ↓
D9U (X509ExtendedTrustManager 包装器)

自定义 TLS 1.3 链：
N0Q.createSocket() → N0P → AbstractC50328Mma.A05()  ← 自定义 TLS 握手
    ↓
C49879Mc7.A00 = C29419D4p(2)    ← 硬编码 ValiCert/DigiCert 根证书
    ↓
checkServerTrusted() → PKIX 校验
```

### 3.3 四个关键 hook 点

| Hook 点 | 文件 | 作用 | 行号 |
|---------|------|------|------|
| `X.Ao5.A01(List)` | `Ao5.java` | 核心哈希白名单校验，绕过则解除 18 个 pin 的限制 | 141 |
| `X.Ao6.AES/AER()` | `Ao6.java` | API 24+ 扩展 pinning（X509TrustManagerExtensions） | 18/23 |
| `X.D9U.checkServerTrusted()` | `D9U.java` | X509ExtendedTrustManager 包装器，处理 SSLEngine | 41/58/68 |
| `X.D4p.checkServerTrusted()` | `C29419D4p.java` | 自定义 TLS 1.3 的 TrustManager，只认硬编码根证书 | 43 |

---

## 4. 环境准备

### 4.1 需要的东西

- **VMOS Pro**（Android 模拟器/虚拟机）或其他 Root 的 Android 设备
- **Charles Web Debugging Proxy**
- **Frida** (Windows 上安装)
- **JADX**（可选，用于自己逆向 APK）
- ADB 工具

### 4.2 安装 Frida

```powershell
# 安装 Frida 命令行工具（Windows）
pip install frida-tools

# 验证
frida --version
```

### 4.3 推送 Frida Server 到设备

```powershell
# 1. 下载对应架构的 frida-server
# https://github.com/frida/frida/releases
# 选 frida-server-{version}-android-arm64.xz

# 2. 解压并推送
adb push frida-server /data/local/tmp/

# 3. 赋予执行权限并启动
adb root
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server -D &"
```

### 4.4 安装 Charles 证书到设备

```powershell
# 手机浏览器打开 http://chls.pro/ssl 下载并安装证书
# 或者在设备设置 → 安全 → 安装证书 → CA 证书
```

---

## 5. 实战步骤

### Step 1: 连接设备并设置代理

```powershell
# 连接 VMOS
adb connect 10.0.0.141:31007

# 设置全局 HTTP 代理（Charles 默认监听 8888，你的电脑 IP）
adb shell settings put global http_proxy 10.0.0.67:8888
```

### Step 2: 启动 frida-server

```powershell
# 确认设备已 root
adb root

# 启动 frida-server
adb shell "/data/local/tmp/frida-server -D &"

# 验证
frida-ps -U
```

### Step 3: 配置 Charles SSL Proxying

1. 打开 Charles → Proxy → SSL Proxying Settings
2. 勾选 Enable SSL Proxying
3. Add 以下规则：
   - `*.whatsapp.net` : `443`
   - `*.whatsapp.com` : `443`
4. **重要**：如果有科学上网工具（Clash/V2Ray），在 Charles → Proxy → External Proxy Settings 里配置上游代理，否则 Charles 连不上被墙的 WhatsApp 服务器

### Step 4: 注入 Frida 脚本

```powershell
frida -U -n WhatsApp -l C:\Users\Admin\AppData\Local\Temp\opencode\frida_whatsapp_bypass_v2.js
```

**不要关闭这个终端窗口！** 终端保持运行，Frida 才会持续注入。

### Step 5: 验证

在 WhatsApp 里随便操作（发消息、刷联系人列表等），看两处：

**Frida 终端输出**：
```
[+] X.D4p - BYPASSED
[+] Ao5.A01() - BYPASSED
```
出现这些日志说明 hook 生效。

**Charles 界面**：
看到 `https://v.whatsapp.net` 等请求不再是 `unknown`，而能显示具体的 API 路径、JSON 请求体、响应内容。

---

## 6. Frida 脚本详解

```javascript
// WhatsApp SSL Pinning Bypass v2
// =========================================

Java.perform(function() {

    // -------------------------------------------------
    // Hook 1: X.Ao5.A01(List)  — 核心 pinning 校验
    // -------------------------------------------------
    // 原始的 A01 方法：
    //   for each cert in chain:
    //     if SHA256(cert.pubkey) IN [18 hardcoded hashes]:
    //       return;                          // 通过
    //   throw CertificateException();        // 拒绝
    //
    // 我们的 hook：直接 return，不抛异常
    // -------------------------------------------------
    var Ao5 = Java.use("X.Ao5");
    Ao5.A01.overload('java.util.List').implementation = function(list) {
        console.log("[+] Ao5.A01() - BYPASSED");
        // 不抛异常 = 接受任何证书
    };

    // -------------------------------------------------
    // Hook 2: X.Ao6.AES / AER — API 24+ 扩展 pinning
    // -------------------------------------------------
    var Ao6 = Java.use("X.Ao6");
    Ao6.AES.overload(
        '[Ljava.security.cert.X509Certificate;',
        'java.lang.String',
        'boolean'
    ).implementation = function() { /* bypass */ };

    Ao6.AER.overload(
        '[Ljava.security.cert.X509Certificate;',
        'java.lang.String'
    ).implementation = function() { /* bypass */ };

    // -------------------------------------------------
    // Hook 3: X.D9U — X509ExtendedTrustManager 包装器
    // -------------------------------------------------
    var D9U = Java.use("X.D9U");
    // 三个重载：普通 / Socket / SSLEngine
    D9U.checkServerTrusted.overload(
        '[Ljava.security.cert.X509Certificate;', 'java.lang.String'
    ).implementation = function() {};
    D9U.checkServerTrusted.overload(
        '[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'java.net.Socket'
    ).implementation = function() {};
    D9U.checkServerTrusted.overload(
        '[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'javax.net.ssl.SSLEngine'
    ).implementation = function() {};

    // -------------------------------------------------
    // Hook 4: X.D4p — TLS 1.3 Hardcoded CA TrustManager
    // -------------------------------------------------
    // 这是最关键的一个。WhatsApp 消息协议走自己实现的
    // TLS 1.3，用 N0Q custom SocketFactory，里面的
    // TrustManager 只信任两个硬编码的根证书：
    //   - ValiCert
    //   - DigiCert Global Root CA
    //
    // 绕过它，Charles 的伪造证书才能通过 TLS 1.3 验证
    // -------------------------------------------------
    var D4p = Java.use("X.D4p");
    D4p.checkServerTrusted.overload(
        '[Ljava.security.cert.X509Certificate;', 'java.lang.String'
    ).implementation = function(certs, authType) {
        console.log("[+] X.D4p.checkServerTrusted() - BYPASSED");
    };

    // -------------------------------------------------
    // Hook 5: CertificateVerifier（Facebook 网络层）
    // -------------------------------------------------
    var CV = Java.use(
        "com.facebook.mobilenetwork.internal.certificateverifier.CertificateVerifier"
    );
    // 尝试 hook verify 的各个重载
    try { CV.verify.overload(
        'java.lang.String', 'javax.net.ssl.SSLSocket'
    ).implementation = function(h,s) {}; } catch(e) {}
    try { CV.verify.overload(
        '[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'boolean'
    ).implementation = function() {}; } catch(e) {}
    try { CV.verify.overload(
        '[[B', 'java.lang.String', 'boolean'
    ).implementation = function() {}; } catch(e) {}
    try { CV.verify.overload(
        '[[B', 'java.lang.String'
    ).implementation = function() {}; } catch(e) {}

    // -------------------------------------------------
    // Hook 6: 延迟加载类补钩（ClassLoader 枚举）
    // -------------------------------------------------
    // X.D4p 可能不是在应用启动时就加载的，而是在
    // 首次创建 TLS 连接时才加载。所以额外通过
    // ClassLoader 枚举来补钩
    // -------------------------------------------------
    Java.enumerateClassLoaders({
        onMatch: function(loader) {
            try {
                var D4pClass = loader.findClass("X.D4p");
                if (D4pClass) {
                    var D4pWrapper = Java.use("X.D4p");
                    D4pWrapper.checkServerTrusted.overload(
                        '[Ljava.security.cert.X509Certificate;',
                        'java.lang.String'
                    ).implementation = function() {
                        console.log("[+] X.D4p (late hook) - BYPASSED");
                    };
                }
            } catch(e) {}
        },
        onComplete: function() {}
    });
});
```

### 关键注意事项

**1. 类名映射（JADX 重命名）**

JADX 反编译时因为 Windows 文件系统不区分大小写，会把 `X.D4p` 和 `X.d4p` 这种同名不同大小写的类重命名为 `X.C29419D4p`。但运行时 JVM 里类名还是 `X.D4p`，所以 Frida 脚本必须用原名：

| JADX 文件名 | 运行时类名 |
|------------|----------|
| `C29419D4p.java` | `X.D4p` |
| `C49879Mc7.java` | `X.Mc7` |
| `C50686Muz.java` | `X.Muz` |

**2. 为什么同时 hook Ao5 和 D4p？**

因为 WhatsApp 有两套完全独立的网络栈：
- **HTTP 请求**（下载媒体、注册、同步等）→ 走 Facebook CertificateVerifier → Ao5/Ao6/D9U 链
- **消息协议**（发消息、收消息）→ 走自定义 TLS 1.3 → N0Q Socket → D4p(2) TrustManager

两套都得绕，少一个就漏流量。

---

## 7. 常见问题排查

### Q: Charles 看到一堆 CONNECT 请求，都是 `unknown`？
**A:** 没开 SSL Proxying。Proxy → SSL Proxying Settings → 添加 `*.whatsapp.net:443` 和 `*.whatsapp.com:443`。

### Q: CONNECT 失败，显示 `Connection timed out`？
**A:** Charles 直连被墙了。Proxy → External Proxy Settings → 配置上游代理走科学上网。

### Q: 看到 `certificate_unknown (46)` TLS 告警？
**A:** Frida 脚本没注入或者注入后进程重启了。重新运行：
```powershell
frida -U -n WhatsApp -l frida_whatsapp_bypass_v2.js
```

### Q: Frida 注入报 `ClassNotFoundException`？
**A:** 类名错了。检查 JADX 重命名，用原始类名（见上表）。或者类还没加载，ClassLoader 枚举补钩会自动处理。

### Q: WhatsApp 闪退？
**A:** 大概率是 VMOS/Android 14 兼容性问题（UI 渲染 crash），与 Frida 无关。重新打开 WhatsApp 再注入即可。

### Q: 如何验证 Frida hook 确实在工作？
**A:** 终端里观察是否有 `[+] X.D4p - BYPASSED` 输出。出现这个 log 说明 WhatsApp 确实在调用被 hook 的方法，而且被成功绕过了。

### Q: 不装 Charles 证书，光用 Frida 行不行？
**A:** 理论上可以。Frida 绕过的是 App 端的证书校验，App 会接受 Charles 的任何伪造证书。但 Charles 签发证书时会产生 TLS `certificate_unknown` 告警——Frida 正好拦截了这个告警的源头（TrustManager 抛异常），所以最终连接成功。

---

## 附录一：完整数据流（从点开 App 到 Charles 捕获）

```
  你点开 WhatsApp（什么都没干，只是打开了）

          │
          ▼
  WhatsApp 进程启动，开始连接服务器
          │
          ▼
  发起网络请求，目标：v.whatsapp.net:443
          │
          │  因为你之前执行过这行命令：
          │  adb shell settings put global http_proxy 10.0.0.67:8888
          │  系统把所有 TCP 连接都劫持到了 Charles
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  实际连接到了 Charles (10.0.0.67:8888)           │
  │  WhatsApp 以为在连 WhatsApp 服务器，               │
  │  其实连的是你电脑上的 Charles                      │
  └─────────────────────────────────────────────────┘
          │
          ▼
  WhatsApp 对 Charles 说："CONNECT v.whatsapp.net:443"
  （通过 HTTP 代理协议说：我要连 v.whatsapp.net）
          │
          ▼
  Charles 收到 CONNECT 请求，自己去连真正的 v.whatsapp.net:443
  （↑ 这一步如果连不上，就是 timeout，需要 Charles 走 Clash 代理）
          │
          ▼
  Charles 连上了真正的 WhatsApp 服务器，两边都就绪
  WhatsApp ──Charles── WhatsApp 服务器
  （Charles 站在正中间，两边都能说话）
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  TLS 握手阶段：Charles 要骗 WhatsApp 信任它     │
  │                                                 │
  │  Charles 现场打印了一张假证书，递给 WhatsApp：  │
  │  ┌──────────────────────────┐                   │
  │  │ 持有者: v.whatsapp.net   │  谎称自己是服务器 │
  │  │ 签发者: Charles CA       │  签字的章是 Charles│
  │  └──────────────────────────┘                   │
  └─────────────────────────────────────────────────┘
          │
          ▼
  WhatsApp 收到这张假证书，开始验证
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  Step 1: 签名验算                               │
  │  "用 Charles CA 的公钥验一下签名"               │
  │  结果：签名确实是 Charles 用自己私钥签的 → ✅ 通过  │
  └─────────────────────────────────────────────────┘
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  Step 2: 查信任库（谁给 Charles CA 担保？）     │
  │                                                 │
  │  证书链往上追溯，顶端的根证书是 "Charles CA"    │
  │  WhatsApp 问："Charles CA 值得信任吗？"         │
  │                                                 │
  │  这里分两条路：                                 │
  │                                                 │
  │  ┌─ 默认路径（大部分 App 走这里）               │
  │  │  查系统信任库（户口本，几百个证书）          │
  │  │  → 你装过 Charles 根证书 → 找到了 → ✅       
  │  │                                              │
  │  └─ WhatsApp 自定路径（D4p TrustManager）       │
  │      不看户口本，掏口袋里的纸条                 │
  │      纸条上只写了两个名字：                     │
  │        ☑ ValiCert                               │
  │        ☑ DigiCert Global Root CA                │
  │        ☐ Charles  ← 纸条上没有！❌              │
  │                                                 │
  │      纸条上没有 Charles → 不信任 → 抛异常       │
  │      → 这就是你在 Charles 里看到的：            │
  │         certificate_unknown (46)                │
  │    "An unknown issue occurred processing the cert" │
  └─────────────────────────────────────────────────┘
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  Step 3: Ao5 公钥哈希白名单检查                 │
  │  （针对不同的网络路径，这里和 Step 2 可能互换顺序）     │
  │                                                 │
  │  WhatsApp 口袋里还有另一张纸条：                │
  │  18 个公钥 SHA-256 哈希值                       │
  │      grX4Ta9HpZx6tSHkmCrvpApTQGo67CYDnvprLg5yRME=  │
  │      58qRu/uxh4gFezqAcERupSkRYBlBAvfcw7mEjGPLnNU=  │
  │      ... (共 18 个)                             │
  │                                                 │
  │  把 Charles 证书的公钥算 SHA-256                │
  │  在白名单里搜 → 没有 → ❌                       │
  │  抛异常："pinning error"                        │
  └─────────────────────────────────────────────────┘
          │
          │  Frida 脚本介入：
          │  Ao5.A01() → hook 直接 return（不抛异常）
          │  D4p.checkServerTrusted() → hook 直接 return
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  ✅ 两张纸条的检查都被跳过了                    │
  │  WhatsApp 接受 Charles 的假证书                 │
  │  TLS 握手完成，Charles 拿到对称加密密钥         │
  └─────────────────────────────────────────────────┘
          │
          ▼
  ┌─────────────────────────────────────────────────┐
  │  数据开始传输                                   │
  │                                                 │
  │  WhatsApp ──加密──▶ Charles ──解密──▶ 查看明文  │
  │                     Charles ──加密──▶ 真实服务器│
  │                                                 │
  │  Charles 窗口里能看到：                         │
  │    https://v.whatsapp.net/v2/sync               │
  │    Request Body: {...JSON...}                   │
  │    Response Body: {...JSON...}                  │
  └─────────────────────────────────────────────────┘
```

### ValiCert / DigiCert 在整个流程中的位置

```
Charles 假证书
    │
    ┌── 签发者是 "Charles CA"
    │   查系统信任库 → Charles 在 → ✅ 普通 App 这里就通过了
    │
    └── WhatsApp 额外掏出一张纸条（只有 ValiCert、DigiCert 两个名字）
         纸条上查不到 Charles → ❌ 拒绝
                                  │
                         这就是 certificate_unknown 错误的来源
                                  │
                         Frida hook D4p.checkServerTrusted
                         让它别查纸条 → ✅ 绕过
```

### Ao5 18 个哈希白名单在整个流程中的位置

```
在 Step 3 或 Step 2 之后（不同的网络路径顺序不同）

WhatsApp 把 Charles 假证书的公钥算个 SHA-256 哈希
    │
    ┌── 去 18 个哈希白名单里搜 → 搜不到 Charles 的哈希
    │
    └── ❌ 拒绝："pinning error"
                    │
          Frida hook Ao5.A01()
          让它别搜白名单 → ✅ 绕过
```

> **一句话总结**：你只是点开了 WhatsApp，系统代理把流量劫持到 Charles，Charles 伪造证书骗 WhatsApp，WhatsApp 掏出两张纸条（ValiCert/DigiCert 名单 + 18 个哈希白名单）检查，全都没 Charles → 拒绝。Frida 就像把 WhatsApp 掏纸条的手按住，让它睁一只眼闭一只眼放行。
