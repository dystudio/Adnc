import { remove, getList, save, exportXls } from '@/api/maint/cfg'
import { getApiUrl } from '@/utils/utils'
import permission from '@/directive/permission/index.js'

export default {
  directives: { permission },
  data() {
    return {
      formVisible: false,
      formTitle: this.$t('config.add'),
      isAdd: true,
      form: {
        id: 0,
        cfgName: '',
        cfgValue: '',
        cfgDesc: ''
      },
      listQuery: {
        pageIndex: 1,
        pageSize: 20,
        cfgName: undefined,
        cfgValue: undefined
      },
      total: 0,
      list: null,
      listLoading: true,
      selRow: {}
    }
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  computed: {
    rules() {
      return {
        cfgName: [
          { required: true, message: this.$t('config.name') + this.$t('common.isRequired'), trigger: 'blur' },
          { min: 3, max: 2000, message: this.$t('config.name') + this.$t('config.lengthValidation'), trigger: 'blur' }
        ],
        cfgValue: [
          { required: true, message: this.$t('config.value') + this.$t('common.isRequired'), trigger: 'blur' },
          { min: 2, max: 2000, message: this.$t('config.value') + this.$t('config.lengthValidation'), trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      getList(this.listQuery).then(response => {
        console.log(response.data)
        this.list = response.data
        this.listLoading = false
        this.total = response.data.total
      })
    },
    search() {
      this.listQuery.pageIndex = 1
      this.fetchData()
    },
    reset() {
      this.listQuery.cfgName = ''
      this.listQuery.cfgValue = ''
      this.listQuery.pageIndex = 1
      this.fetchData()
    },
    handleFilter() {
      this.listQuery.pageIndex = 1
      this.getList()
    },
    handleClose() {

    },
    fetchNext() {
      this.listQuery.pageIndex = this.listQuery.pageIndex + 1
      this.fetchData()
    },
    fetchPrev() {
      this.listQuery.pageIndex = this.listQuery.pageIndex - 1
      this.fetchData()
    },
    fetchPage(pageIndex) {
      this.listQuery.pageIndex = pageIndex
      this.fetchData()
    },
    changeSize(pageSize) {
      this.listQuery.pageSize = pageSize
      this.fetchData()
    },
    handleCurrentChange(currentRow, oldCurrentRow) {
      this.selRow = currentRow
    },
    resetForm() {
      this.form = {
        id: 0,
        cfgName: '',
        cfgValue: '',
        cfgDesc: ''
      }
    },
    add() {
      this.resetForm()
      this.formTitle = this.$t('config.add')
      this.formVisible = true
      this.isAdd = true
    },
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          save({
            id: this.form.id,
            cfgName: this.form.cfgName,
            cfgValue: this.form.cfgValue,
            cfgDesc: this.form.cfgDesc
          }).then(response => {
            this.$message({
              message: this.$t('common.optionSuccess'),
              type: 'success'
            })
            this.fetchData()
            this.formVisible = false
          })
        } else {
          return false
        }
      })
    },
    checkSel() {
      if (this.selRow && this.selRow.id) {
        return true
      }
      this.$message({
        message: this.$t('common.mustSelectOne'),
        type: 'warning'
      })
      return false
    },
    editItem(record){
      this.selRow = record
      this.edit()
    },
    edit() {
      if (this.checkSel()) {
        this.isAdd = false
        this.form = this.selRow
        this.formTitle = this.$t('config.edit')
        this.formVisible = true
      }
    },
    removeItem(record){
      this.selRow = record
      this.remove()
    },
    remove() {
      if (this.checkSel()) {
        var id = this.selRow.id
        this.$confirm(this.$t('common.deleteConfirm'), this.$t('common.tooltip'), {
          confirmButtonText: this.$t('button.submit'),
          cancelButtonText: this.$t('button.cancel'),
          type: 'warning'
        }).then(() => {
          remove(id).then(response => {
            this.$message({
              message: this.$t('common.optionSuccess'),
              type: 'success'
            })
            this.fetchData()
            // this.selRow.remove()
          })
        }).catch(() => {
        })
      }
    },
    exportXls() {
      exportXls(this.listQuery).then(response => {
        window.location.href= getApiUrl() + '/file/download?idFile='+response.data.id
      })

    }

  }
}
