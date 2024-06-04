// leaderboard script
(function () {
  "use strict";

  const evaluationApp = document.getElementById("evaluationApp");
  if (!evaluationApp) return;

  const { createApp } = Vue
  const app = createApp({
    data() {
      return {
        type: 'api', // api | module
        modelName: '',
        teamName: '',
        apiEndpoint: '',
        repositoryUrl: '',
        parameter: '',
        apiDoc: '',
        websiteUrl: '',
        modelDesc: '',
        phone: '',
        email: '',
        resultPublishType: 'public', // public | private
        errorMsg: '',
        timer: null,
        lanyType: 'zh',
        submiting: false,
        successed: false,
        successMsg: '测评申请提交成功，请耐心等待'
      }
    },
    computed: {
      resultPublishTypeValue() {
        return this.resultPublishType === 'public' ? 1 : 0;
      }
    },
    mounted() {
      const url = new URL(window.location.href);
      if (/\/en/.test(url.pathname)) {
        this.lanyType = 'en';
      }
    },
    methods: {
      typeChange(type) {
        this.type = type;
      },
      resultPublishTypeChange(type) {
        this.resultPublishType = type;
      },
      getData() {
        const baseData = {
          type: this.type,
          model_name: this.modelName,
          team_name: this.teamName,
          parameter: this.parameter,
          model_desc: this.modelDesc,
          phone: this.phone,
          email: this.email,
          result_publish: this.resultPublishTypeValue
        }
        if (this.type === 'api') {
          return {
            ...baseData,
            api_endpoint: this.apiEndpoint,
            api_doc: this.apiDoc,
            website_url: this.websiteUrl
          }
        } else {
          return {
            ...baseData,
            repository_url: this.repositoryUrl,
          }
        }
      },
      resetData() {
        this.modelName = '';
        this.teamName = '';
        this.apiEndpoint = '';
        this.repositoryUrl = '';
        this.parameter = '';
        this.apiDoc = '';
        this.websiteUrl = '';
        this.modelDesc = '';
        this.phone = '';
        this.email = '';
      },
      setErrorMsg(msg) {
        this.errorMsg = msg;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.errorMsg = '';
        }, 3000);
      },
      validate() {
        const config = {
          zh: {
            modelName: {
              required: '请输入模型名称'
            },
            teamName: {
              required: '请输入组织/团队名称'
            },
            parameter: {
              format: '参数量格式不正确'
            },
            apiEndpoint: {
              required: '请输入模型API Endpoint',
              format: '模型API Endpoint格式不正确'
            },
            email: {
              required: '请输入邮箱',
              format: '邮箱格式不正确'
            },
            repositoryUrl: {
              required: '请输入模型仓库地址',
              format: '模型仓库地址格式不正确'
            }
          },
        }
        const numberReg = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
        const emailReg = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const urlReg = /^(?:(?:(?:https?|ftp):)?\/\/)(?:(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})+(?::(?:[^\]\[?\/<~#`!@$^&*()+=}|:";',>{ ]|%[0-9A-Fa-f]{2})*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        const error = config[this.lanyType];
        if (!this.modelName) {
          return error.modelName.required;
        }
        if (!this.teamName) {
          return error.teamName.required;
        }
        if (!numberReg.test(this.parameter)) {
          return error.parameter.format;
        }
        if (this.type === 'api') {
          if (!this.apiEndpoint) {
            return error.apiEndpoint.required;
          }
          if (!urlReg.test(this.apiEndpoint)) {
            return error.apiEndpoint.format;
          }
        }
        if (this.type === 'model') {
          if (!this.repositoryUrl) {
            return error.repositoryUrl.required;
          }
          if (!urlReg.test(this.repositoryUrl)) {
            return error.repositoryUrl.format;
          }
        }
        if (!this.email) {
          return error.email.required;
        }
        if (!emailReg.test(this.email)) {
          return error.email.format;
        }
        return true;
      },
      submit() {
        const res = this.validate();
        if (res !== true) {
          this.setErrorMsg(res);
          return;
        }
        if (this.submiting) {
          return;
        }
        this.submiting = true;
        const data = this.getData();
        console.log(data)
        fetch('http://127.0.0.1/submit', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(async response => {
          const res = await response.json();
          this.submiting = false;
          if (res.code !== 0) {
            this.setErrorMsg(res.message);
            return;
          }
          this.successed = true;
          if (this.lanyType === 'en') {
            this.successMsg = 'Evaluation submitted successfully, please be patient and wait.';
          }
          this.resetData();
        }).catch(error => {
          const errorMsg = this.lanyType === 'zh' ? '系统异常，请稍后再试' : 'System error, please try again later.';
          this.setErrorMsg(errorMsg);
          this.submiting = false;
        });
        
      },
    }
  })
  app.config.compilerOptions.delimiters = ['${', '}']
  app.mount('#evaluationApp')

})();
