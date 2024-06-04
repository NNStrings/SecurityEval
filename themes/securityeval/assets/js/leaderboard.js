import bestJSON from "data/best.json";

(function () {
  "use strict";

  function initTableData(data) {
    return data.map((item) => {
      return {
        ...item,
        'overall_average': 0,
      }
    })
  }

  const bestData = initTableData(bestJSON);

  const leaderboardApp = document.getElementById("leaderboardApp");
  if (!leaderboardApp) return;

  const langType = /\/en/.test(new URL(window.location.href).pathname) ? 'en' : 'zh';

  const overallAverageName = langType === 'zh' ? '整体平均' : 'Overall average';

  const overallAverageTips = {
    content: langType === 'zh' ? '将该模型在n个数据集上的准确率直接算均值。该数值越大代表模型性能越好。' : 'Calculate the average accuracy of the model on n datasets directly. A higher value indicates better model performance.'
  }

  const formatterNum = function ({ cellValue }) {
    return isNaN(Number(cellValue)) ? 'N/A' : Number(cellValue).toFixed(4);
  }
  const formatterRank = function ({ cellValue }) {
    return isNaN(Number(cellValue)) ? 'N/A' : Number(cellValue);
  }
  const averageColumn = [
    { field: 'overall_average', title: overallAverageName, 'title-help': overallAverageTips, width: langType === 'zh' ? 120 : 160, formatter: formatterNum, align: 'center', sortable: true, visible: true },
  ]
  const datasetColumn = [
    { field: 'illegal-act', title: '非法活动', width: 140, align: 'center', sortable: true, visible: true },
    { field: 'child-abuse', title: '虐待儿童', width: 140, align: 'center', sortable: true, visible: true },
    { field: 'violence', title: '暴力', width: 80, align: 'center', sortable: true, visible: true },
    { field: 'malware-virus', title: '恶意软件病毒', width: 140, align: 'center', sortable: true, visible: true },
    { field: 'physical-injury', title: '身体伤害', width: 140, align: 'center', sortable: true, visible: true },
    { field: 'economic-damage', title: '经济损害', width: 80, align: 'center', sortable: true, visible: true },
    { field: 'cheat', title: '欺诈/诈骗', width: 130, align: 'center', sortable: true, visible: true },
    { field: 'adult-content', title: '成人内容', width: 80, align: 'center', sortable: true, visible: true },
    { field: 'political', title: '政治宣传', width: 80, align: 'center', sortable: true, visible: true },
    { field: 'privacy-invading', title: '隐私侵犯活动', width: 140, align: 'center', sortable: true, visible: true },
    { field: 'improper-financial', title: '不当金融行为', width: 80, align: 'center', sortable: true, visible: true },
    { field: 'Standard', title: 'DangerousQA (Standard)', width: 120, align: 'center', sortable: true, visible: true },
    { field: 'CoT', title: 'DangerousQA(CoT)', width: 110, align: 'center', sortable: true, visible: true },
    { field: 'Cou', title: 'DangerousQA(Cou)', width: 90, align: 'center', sortable: true, visible: true },
    { field: 'vietnamese', title: 'vietnamese', width: 90, align: 'center', sortable: true, visible: true },
  ]

  const { createApp } = Vue
  const app = createApp({
    data() {
      return {
        fixedColumn: document.body.offsetWidth > 640 ? 'left' : '',
        sampleType: 'best',
        languagesType: 'all',
        abilityType: 'all',
        gradeType: 'all',
        quickViewType: '',
        averageColumn,
        datasetColumn,
        tableData: this.tableDataFilter(bestData),
        sortConfig: {
          defaultSort: {
            field: 'ability_average',
            order: 'desc'
          },
          showIcon: false,
          sortMethod: this.customSortMethod
        },
        loading: false,
        columns: [],
        filterLabelStyle: {
          width: langType === 'zh' ? '80px' : '120px'
        },
        isEmpty: false,
      }
    },
    computed: {
      datasetList() {
        return this.datasetColumn.map(item => item.field)
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.resetTableHeight();
        this.columns = this.$refs.Table.getColumns();
        this.updateTableData();
      })
      window.addEventListener('resize', this.resetTableHeight);
    },
    methods: {
      resetTableHeight() {
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const headerHeight = document.querySelector('#header').offsetHeight;
        const filterHeight = document.querySelector('#filterWrapper').offsetHeight;
        let tableHeight = windowHeight - headerHeight - filterHeight - 40;
        if (tableHeight < 520) {
          tableHeight = 520;
        }
        document.querySelector('#tableWrapper').style.height = tableHeight + 'px';
      },
      sampleTypeChange(type) {
        this.sampleType = type;
        this.delayResetColumn()
      },
      languagesTypeChange(type) {
        if (this.quickViewType) {
          return;
        }
        this.languagesType = type;
        this.delayResetColumn()
      },
      abilityTypeChange(type) {
        if (this.quickViewType) {
          return;
        }
        this.abilityType = type;
        this.delayResetColumn()
      },
      gradeTypeChange(type) {
        if (this.quickViewType) {
          return;
        }
        this.gradeType = type;
        this.delayResetColumn();
      },
      quickViewTypeChange(type) {
        if (type !== this.quickViewType) {
          this.languagesType = 'all';
          this.abilityType = 'all';
          this.gradeType = 'all';
          this.quickViewType = type;
        } else {
          this.quickViewType = '';
        }
        setTimeout(() => {
          this.resetQuickColumn();
        }, 0)
      },
      visibleColumn(field, visible) {
        this.columns.filter(column => column.field === field)[0].visible = visible;
      },
      delayResetColumn() {
        setTimeout(() => {
          if (this.quickViewType) {
            this.resetQuickColumn();
          } else {
            this.resetColumn()
          }
        }, 0)
      },
      arrayMerge(arrs) {
        const arr = []
        arrs.forEach(item => {
          arr.push(...item)
        })
        return Array.from(new Set(arr));
      },
      resetQuickColumn() {
        // 选择数据集速览, 只显示当前选择数据集的列
        if (this.quickViewType) {
          // 不显示能力平均, 整体平均, 加权平均, 累加排位
          this.averageColumn.forEach(item => {
            this.visibleColumn(item.field, false)
          })
          this.datasetColumn.forEach(item => {
            if (item.field === this.quickViewType) {
              this.visibleColumn(item.field, true)
            } else {
              this.visibleColumn(item.field, false)
            }
          })
          this.$refs.Table.refreshColumn();
          this.$refs.Table.reloadData(this.tableData);
          this.$refs.Table.sort(this.quickViewType, 'desc');
          this.isEmpty = false;
        } else {
          this.averageColumn.forEach(item => {
            this.visibleColumn(item.field, true)
          })
          this.$refs.Table.refreshColumn();
          this.resetColumn();
        }
      },
      resetColumn() {
        const languagesConfig = this.languagesType;
        const abilityConfig = this.abilityType;
        const gradeConfig = this.gradeType;
        datasetColumn.forEach(item => {
          if (languagesConfig.includes(item.field) && abilityConfig.includes(item.field) && gradeConfig.includes(item.field)) {
            this.visibleColumn(item.field, true)
          } else {
            this.visibleColumn(item.field, false)
          }
        })
        this.$refs.Table.refreshColumn();
        this.updateTableData();
        const columns = this.$refs.Table.getColumns();
        if (columns.length === 7) {
          this.isEmpty = true;
        } else {
          this.isEmpty = false;
        }
      },

      headerCellClickEvent ({ column }) {
        if (column.sortable) {
          if (column.order === 'desc') {
            this.$refs.Table.sort(column.property, 'asc')
          } else {
            this.$refs.Table.sort(column.property, 'desc')
          }
        }
      },

      customSortMethod({ data, sortList }) {
        return data.sort((a, b) => {
          const sortField = sortList[0].field;
          const sortType = sortList[0].order;
          const sortFieldData = isNaN(Number(a[sortField])) ? 0 : Number(a[sortField]);
          const sortFieldData2 = isNaN(Number(b[sortField])) ? 0 : Number(b[sortField]);
          if (sortType === 'asc') {
            return sortFieldData - sortFieldData2;
          }
          if (sortType === 'desc') {
            return sortFieldData2 - sortFieldData;
          }
        })
      },

      formatterNum: formatterNum,

      formatterRank: formatterRank,

      tableDataFilter(data) {
        const ignoreList = [];
        return data.filter(item => !ignoreList.includes(item.name));
      },

      // 更新整体平均值
      // 选定数据集中的平均值
      updateOverallAverage() {
        const columns = this.$refs.Table.getColumns();
        const datasetColumns = columns.filter(item => this.datasetList.includes(item.field));
        this.tableData.forEach((item) => {
          let count = 0;
          try {
            datasetColumns.forEach((column) => {
              if (column.field === "Standard") throw Error();
              count += item[column.field] * 10000
            })
          }
          catch (e) {
            item.overall_average = (Math.round(count / (datasetColumns.length - 4)) / 10000).toFixed(4);
          }
          // console.log(count);
        })
      },

      updateTableData() {
        this.updateOverallAverage();
        this.$refs.Table.reloadData(this.tableData);
        this.$refs.Table.sort('ability_average', 'desc');
      },
    }
  })
  app.use(VXETable)
  app.config.compilerOptions.delimiters = ['${', '}']
  app.mount('#leaderboardApp')

})();
