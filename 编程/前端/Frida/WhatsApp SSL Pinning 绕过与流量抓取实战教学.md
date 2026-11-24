# WhatsApp 抓包手把手教程

## 原理

### 1. 普通 HTTPS 为什么可以被 Charles 查看

普通 HTTPS 的通信过程是：

~~~text
WhatsApp -> Charles -> 真实服务器
~~~

Charles 先向真实服务器建立一条 TLS 连接，再给 WhatsApp 生成一张临时服务器证书。临时证书由 Charles Root Certificate 签发。

如果 WhatsApp 信任 Charles Root Certificate，Charles 可以在两边分别建立 TLS，并查看中间的 HTTP 请求和响应。

### 2. Charles 证书为什么不一定有效

Android 默认只信任系统 CA。Android 7 以后，应用是否信任用户安装的 CA，要由应用自己的 Network Security Configuration 决定。

WhatsApp 还可能增加程序化证书校验：

~~~text
服务器证书 -> Android TrustManager
           -> WhatsApp 自定义 TrustManager
           -> 公钥 pinning
           -> 主机名校验
~~~

其中任意一层拒绝 Charles 证书，Charles 都只能显示 CONNECT、TLS 信息或 unknown。

### 3. 当前 WhatsApp 版本的证书校验

当前设备安装的 WhatsApp 版本是 2.26.35.76。REA 分析和运行日志确认了这些入口：

~~~text
X.C0oJ.A01(List)：公钥 pinning
X.0oM.AEy / AEz：扩展证书校验
X.JE0.checkServerTrusted：PKIX 信任链校验
NetworkSecurityTrustManager.checkPins：Android pin-set
CertificateVerifier.verify：Facebook 网络层校验
Conscrypt.checkTrustedRecursive：系统证书链校验
~~~

当前日志曾直接记录 X.JE0.checkServerTrusted 抛出 TrustAnchor 错误。因此旧版本的 Ao5、D4p、D9U 类名不能直接当作当前版本规则。

### 4. 为什么当前需要 mitmproxy

当前 Charles 4.6.8 入口实际按 TLS 1.2 接收。WhatsApp 当前连接提出 TLS 1.3，直接连接 Charles 会出现：

~~~text
protocol_version (70)
client supported TLSv1.3
server preferences TLS1.2
~~~

mitmproxy 接收 VMOS 的 TLS 1.3，再用 TLS 1.2 把请求交给 Charles：

~~~text
VMOS TLS 1.3 -> mitmproxy 8890 -> Charles 8888 TLS 1.2
~~~

这一步解决协议协商问题。Frida hook 解决 Charles 证书被 WhatsApp 拒绝的问题。两者作用不同。

### 5. 为什么发消息不一定出现 HTTP 接口

WhatsApp 的统计、贴纸、媒体和部分账号操作使用 HTTP/Tigon，可以显示 URL 和 JSON。

当前设备的消息和回执使用二进制协议节点，通过 Noise 长连接传输。消息正文先经过 Signal 加密，保存在消息节点的 `enc` 子节点中；Noise 负责外层连接加密。

Frida 在 Noise 处理位置能够读取协议节点。读取聊天文字需要在 Signal 加密之前或解密之后观察应用中的正文对象。Charles 不会自动显示这些文字。
## 目标

让 VMOS 中的 WhatsApp 请求经过：

~~~text
VMOS -> mitmproxy 8890 -> Charles 8888 -> Clash 7897 -> WhatsApp
~~~

当前设备：

~~~text
电脑：10.0.0.67
VMOS：10.0.0.112:31006
Charles：8888
mitmproxy：8890
Clash：7897
~~~

## 1. 启动 Charles

打开 Charles。

菜单：

~~~text
Proxy -> Proxy Settings
HTTP Proxy Port = 8888

Proxy -> SSL Proxying Settings
Enable SSL Proxying = 勾选
Add Host = *
Add Port = 443

Proxy -> External Proxy Settings
HTTP Host = 127.0.0.1
HTTP Port = 7897
HTTPS Host = 127.0.0.1
HTTPS Port = 7897
~~~

PowerShell 检查 Charles：

~~~powershell
Get-NetTCPConnection -State Listen -LocalPort 8888
~~~

必须看到 8888 正在监听。

## 2. 启动 mitmproxy 转接

PowerShell 执行：

~~~powershell
mitmdump --mode upstream:http://127.0.0.1:8888 --listen-host 10.0.0.67 --listen-port 8890 --set ssl_verify_upstream_trusted_ca=C:\Users\Admin\Desktop.pem --set flow_detail=1
~~~

看到 listening at 10.0.0.67:8890，说明转接服务已启动。

不要关闭这个窗口。

检查端口：

~~~powershell
Get-NetTCPConnection -State Listen -LocalPort 8890
~~~

## 3. 连接 VMOS

~~~powershell
$device = '10.0.0.112:31006'
adb connect $device
adb -s $device devices -l
~~~

必须看到：

~~~text
10.0.0.112:31006    device
~~~

## 4. 设置 VMOS 代理

~~~powershell
adb -s $device shell settings put global http_proxy '10.0.0.67:8890'
adb -s $device shell settings get global http_proxy
~~~

必须返回：

~~~text
10.0.0.67:8890
~~~

## 5. 启动 Frida Server

~~~powershell
adb -s $device root
adb -s $device shell 'pkill -f frida-server || true'
adb -s $device shell 'nohup /data/local/tmp/frida-server-17.15.3 >/data/local/tmp/frida-server.log 2>&1 &'
adb -s $device forward --remove tcp:27042
adb -s $device forward tcp:27042 tcp:27042
frida-ps -H 127.0.0.1:27042 -ai
~~~

列表中必须有 WhatsApp。

## 6. 检查 WhatsApp 版本

~~~powershell
adb -s $device shell dumpsys package com.whatsapp | Select-String 'versionName|versionCode|primaryCpuAbi'
~~~

当前设备：

~~~text
versionName = 2.26.35.76
primaryCpuAbi = arm64-v8a
~~~

版本变化以后，必须重新分析 APK 类名。

## 7. 使用当前版本 hook

当前版本实际使用的证书检查入口：

~~~text
X.JE0.checkServerTrusted
X.C0oJ.A01
X.0oM.AEy
X.0oM.AEz
android.security.net.config.NetworkSecurityTrustManager.checkPins
CertificateVerifier.verify
Conscrypt.checkTrustedRecursive
~~~

当前可用脚本：

~~~text
C:\Users\Admin\agent-tools\vmos-diag\charles31006\capture.js
~~~

附加 WhatsApp：

~~~powershell
$pid = (adb -s $device shell pidof com.whatsapp).Trim().Split(' ')[0]
frida -H 127.0.0.1:27042 -p $pid -l C:\Users\Admin\agent-tools\vmos-diag\charles31006\capture.js -o C:\Users\Admin\agent-tools\vmos-diag\charles31006\capture.log -q -t inf --no-auto-reload --exit-on-error
~~~

必须看到：

~~~text
[installed] X.JE0.checkServerTrusted
[installed] X.C0oJ.A01
[installed] CertificateVerifier.verify
[installed] NetworkSecurityTrustManager.checkPins
[ready] pid=...
~~~

WhatsApp 重启以后，重新读取 PID，重新附加。

## 8. 验证普通 HTTPS

PowerShell 执行：

~~~powershell
adb -s $device shell am start -n com.whatsapp/com.whatsapp.stickers.ui.store.StickerStoreActivity
~~~

Charles 左侧应该出现：

~~~text
media-fra3-1.cdn.whatsapp.net
  wa
    static
      sticker
~~~

点击 sticker 子项。

右侧打开 Contents：

~~~text
Request：请求头和查询参数
Response：响应内容
Status：Complete
Response Code：200 或 304
~~~

304 表示服务器确认缓存有效，不表示失败。

## 9. 验证 api.whatsapp.net

当前已经验证的接口：

~~~text
POST api.whatsapp.net/falco/pigeon_nest
POST api.whatsapp.net/falco/pigeon_health_metrics
POST api.whatsapp.net/falco/pigeon_health_metrics
~~~

查看方法：

~~~text
点击 api.whatsapp.net
展开 falco
点击具体请求
右侧 Contents
查看 JSON 或 JSON Text
~~~

## 10. 验证 Charles 是否抓到请求

设备连接：

~~~powershell
adb -s $device shell 'ss -ntp | grep com.whatsapp'
~~~

看到：

~~~text
com.whatsapp -> 10.0.0.67:8890
~~~

表示请求经过 mitmproxy。

mitmproxy 日志应该出现：

~~~text
client connect
server connect 127.0.0.1:8888
host、method、status
~~~

Charles 中应该看到解密后的 URL 和响应状态。

## 11. 发消息为什么没有普通接口

发送消息使用 Noise、Fizz 和二进制长连接。

Charles 可以显示：

~~~text
TCP 连接
TLS 握手
CONNECT
WebSocket 帧
~~~

Charles 不会自动显示：

~~~text
POST /send-message
message=...
~~~

如果设备连接显示：

~~~text
com.whatsapp -> 服务器IP:443
~~~

说明 native 长连接绕过了 HTTP proxy。

如果需要消息正文：

1. 当前版本在 `SendE2EMessageJob` 创建时读取 `X.Bc8.conversation_` 或 `extendedTextMessage_.text_`，记录发送正文与消息 ID。
2. 在 `X.17W.A0i(String)` 和 `A0f()` 观察接收正文，通过消息 ID 与当前连接收到的消息节点关联。
3. 正文以 `message_plaintext` 事件写入 `C:\Users\Admin\agent-tools\vmos-diag\charles31006\message-nodes.jsonl`。
4. 打开 `http://127.0.0.1:8080/`，刷新页面并点击播放按钮。左侧选择 `message_plaintext`，在“消息正文”列查看内容。

2026-11-11 15:49，当前设备验证发送正文 `E`、接收正文 `H`；发送正文已经与同一消息 ID 的出站节点、服务器确认和已读回执关联。图片、语音及其他媒体内容尚未验证。

旧脚本中的 X.Ao5、X.D4p、X.D9U 不能直接用于当前版本。

## 12. 常见错误

### unknown

检查：

~~~powershell
Get-NetTCPConnection -State Listen -LocalPort 8888,8890,7897
adb -s $device shell settings get global http_proxy
~~~

### protocol_version (70)

客户端提出 TLS 1.3。确认 VMOS 使用 8890，不是 8888。

### certificate_unknown 或 TrustAnchor

当前 APK 仍有未 hook 的证书入口。重新分析 APK，不要复制旧类名。

### WhatsApp 崩溃

停止递归握手诊断 hook。重启 WhatsApp，再重新附加 Frida。

## 13. 端口关系

~~~text
Charles 接收端口：8888
Clash 上游端口：7897
mitmproxy 接收端口：8890
VMOS 代理：10.0.0.67:8890
~~~

127.0.0.1:19090 是 Clash 控制接口，不是代理端口。

## 为什么当前需要 mitmproxy

当前电脑使用 Charles 4.6.8。

WhatsApp 当前连接提出 TLS 1.3，Charles 入口显示的服务端协议偏好是 TLS 1.2，因此直接把 VMOS 代理设置为 Charles 8888 时，会出现：

~~~text
protocol_version (70)
client supported protocol versions: TLSv1.3
server preferences: TLS1.2
~~~

这个错误发生在证书校验以前，不是 Charles Root Certificate 没安装导致的。

电脑中的 Charles 使用 JDK 11.0.17。JDK 本身支持 TLS 1.3，但 Charles 4.6.8 的内部 TLS 配置生成器只列出 TLSv1.2、TLSv1.1、TLSv1 和 SSLv3，没有把 TLS 1.3 作为客户端连接到 Charles 的协议。

因此当前代理链需要这样配置：

~~~text
VMOS TLS 1.3
  -> mitmproxy 10.0.0.67:8890
  -> Charles 127.0.0.1:8888，TLS 1.2
  -> Clash 127.0.0.1:7897
~~~

mitmproxy 只负责接收 VMOS 的 TLS 1.3，再把请求交给 Charles；Charles 仍负责 SSL Proxying、请求树、请求头、请求体和响应查看。

直接使用 Charles 8888 需要换成支持这条 TLS 1.3 代理路径的 Charles，或者在 WhatsApp native Fizz 连接中强制使用 TLS 1.2。Java 层 setEnabledProtocols 不能覆盖 native Fizz。
