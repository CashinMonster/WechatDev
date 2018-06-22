<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 添加系统用户</el-button>
		<el-table :data="systemUser" border style="width: 100%;" v-loading="loading">
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="username" label="用户名" width="200">
			</el-table-column>
			<el-table-column prop="title" label="角色" width="200">
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
				<el-form-item label="用户名" prop="username">
					<el-input v-model="ruleForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password" v-if="addOrEdit==-1" key="-1">
					<el-input v-model="ruleForm.password"></el-input>
				</el-form-item>
				<el-form-item label="新密码"  v-else key="1">
					<el-tooltip class="item" effect="dark" content="需要更换密码填写，不需要不填写" placement="bottom">	
					     <el-input v-model="ruleForm.newpassword"></el-input>
					</el-tooltip>
				</el-form-item>
				<el-form-item label="角色" prop="id" >
					<el-select v-model="ruleForm.id" placeholder="请选择角色">
						<el-option v-for="item in roleManage" :key="item.id" :label="item.title" :value="item.id">
						</el-option>
					</el-select>
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
				systemUser: [],
				roleManage: [],
				loading: true,
				loading2: false,
				dialogVisible: false,
				ruleForm: {
					username: '',
					password: '',
					id:'',
					newpassword:''
				},
				addOrEdit: -1, //区别是新增还是编辑 -1 新增 id 编辑
				title: "",
				rules: {
					username: [{
						trigger: 'blur',
						required: true,
						message: '请输入用户名'
					}],
					password: [{
						trigger: 'blur',
						required: true,
						message: '请输入密码'
					}],
					id: [{
						trigger: 'change',
						required: true,
						message: '请选择角色'
					}]
				}
			}
		},
		methods: {
			getSystemUser() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/index.html').then(res => {
					this.loading = false
					if(res.status == 1) {
						this.systemUser = res.userlist;
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
			add(row) {
				this.dialogVisible = true;
				if(row != -1) {
					this.addOrEdit = row.userid; //编辑
					this.title = "编辑系统用户";
					this.ruleForm.username=row.username
					this.ruleForm.id=row.id
					this.ruleForm.newpassword=''
				} else {
					this.addOrEdit = -1; //新增
					this.title = "添加系统用户";
					this.ruleForm = {
						username: '',
						password: '',
						id:''
					};
				}
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
			//提交信息
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading2 = true;
						var data = {
							username: this.ruleForm.username,
							role: this.ruleForm.id
						}
						if(this.addOrEdit != -1) { //编辑
							data.id = this.addOrEdit
							data.newpassword=this.ruleForm.newpassword
	                        this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/editUser.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getSystemUser();
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
						   data.password=this.ruleForm.password
							this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Userauth/addUser.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getSystemUser();
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
		   del(row) {
				this.$confirm('是否删除 ' + row.username+" 这个用户")
					.then(_ => {
						let data = {
							id: row.userid
						}
						this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Userauth/delUser.html', data).then(res => {
							if(res.status == 1) {
								this.$message.success(res.msg);
								this.getSystemUser();
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
			}
		},
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'systemUser');
				this.getSystemUser();
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