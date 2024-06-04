# SecurityEval

SecurityEval 大模型安全能力的模型 web ui

### Environment

- Hugo Extended v0.115+
- Node v18+
- Go v1.20+

### Install

#### Windows 系统

软件包管理器 chocolate 安装：

```bash
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```

Hugo 安装命令

```bash
choco install hugo-extended
```

Nodejs 安装命令

```bash
choco install nodejs-lts --version="20.14.0"
```

Go 安装：

<div><a herf="https://go.dev/doc/install"></a>下载地址</div>

#### Linux 系统

Go 安装：

Hugo 安装命令

```bash
sudo snap install hugo
```

Nodejs 安装命令

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
```

Go 安装：

<div><a herf="https://go.dev/doc/install">下载地址</a></div>

### Run

```bash
npm install
npm run dev
```
