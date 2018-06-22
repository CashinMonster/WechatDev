<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 添加用户角色</el-button>
		<el-table :data="roleManage" border style="width: 100%;" v-loading="loading">
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="title" label="角色" width="200" key="2">
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="success" size="middle" @click="add(scope.row)"><i class="el-icon-edit"></i></el-button>
					<el-button type="danger" size="middle" @click="del(scope.row)"><i class="el-icon-delete"></i></el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--添加的弹框-->
		<el-dialog :title="title" :visible.sync="dialogVisible" width="640px" top="5vh" :close-on-click-modal="false">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" status-icon>
				<el-form-item label="角色名称" prop="title" key="1">
					<el-input v-model="ruleForm.title"></el-input>
				</el-form-item>
				<el-form-item label="选择权限">
					<el-checkbox-group v-model="ruleForm.rules" size="small">
						<el-checkbox v-for="item in allRules" :key="item.id" :label="item.id" :value="item.id" border>{{item.title}}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
			    <el-button type="primary"  @click="submitForm('ruleForm')" v-loading="loading2">保 存</el-button>
  			</span>
		</el-dialog>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				roleManage: [],
				allRules: [],
				loading: true,
				loading2: false,
				dialogVisible: false,
				ruleForm: {
					title: '',
					rules: []
				},
				addOrEdit: -1, //区别是新增还是编辑 -1 新增 id 编辑
				title: "",
				rules: {
					title: [{
						trigger: 'blur',
						required: true,
						message: '请输入用户名'
					}]
				}
			}
		},
		methods: {
			getRoleManage() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/getAllRole.html').then(res => {
					this.loading = false
					if(res.status == 1) {
						this.roleManage = res.rolelist;
					} else if(res.status == 2) {
						this.$router.push({
							name: 'login',
							path: '/login'
						});
					} else {
						this.$message.error(res.msg);
					}
				});
			},
			getAllRules() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/getAllRules.html').then(res => {
					if(res.status == 1) {
						this.allRules = res.rolelist;
					} else if(res.status == 2) {
						this.$router.push({
							name: 'login',
							path: '/login'
						});
					} else {
						this.$message.error(res.msg);
					}
				});
			},
			// 添加公众号
			add(row) {
				this.dialogVisible = true;
				if(row != -1) {
					this.addOrEdit = row.id; //编辑
					this.title = "编辑用户角色";
                    this.ruleForm.title=row.title;
                    this.ruleForm.rules=row.rules;
					
				} else {
					this.addOrEdit = -1; //新增
					this.title = "添加用户角色";
					this.ruleForm = {
						title: '',
						rules: []
					};
				}
			},
			del(row) {
				this.$confirm('是否删除 ' + row.title + " 这个角色")
					.then(_ => {
						let data = {
							id: row.id
						}
						this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/delRole.html', data).then(res => {
							if(res.status == 1) {
								this.$message.success(res.msg);
								this.getRoleManage();
							} else if(res.status == 2) {
								this.$router.push({
									name: 'login',
									path: '/login'
								});
							} else {
								this.$message.error(res.msg);
							}
						});
					}).catch(_ => {});
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading2 = true;
						var data = {
							title: this.ruleForm.title,
							rules: this.ruleForm.rules
						}
						if(this.addOrEdit != -1) { //编辑
							data.id = this.addOrEdit
							this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/editRole.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getRoleManage();
								} else if(res.status == 2) {
									this.$router.push({
										name: 'login',
										path: '/login'
									});
								} else {
									this.$message.error(res.msg);
								}
							});
						} else {
							this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/addRole.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getRoleManage();
								} else if(res.status == 2) {
									this.$router.push({
										name: 'login',
										path: '/login'
									});
								} else {
									this.$message.error(res.msg);
								}
							});
						}
					}
				});
			},
		},
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'roleManage');
				this.getRoleManage();
				this.getAllRules();
				if(sessionStorage.getItem("name")) {
					this.$emit('nowPublic', sessionStorage.getItem("name"));
				} else {
					this.$emit('nowPublic', '暂时没有哦');
				}

			});
		},
	}
</script>

<style scoped>
	.addPublic {
		margin-bottom: 20px;
	}
</style>