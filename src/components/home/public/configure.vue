<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 添加公众号</el-button>
		<el-table :data="publicConfig" border style="width: 100%;" v-loading="loading" >
			<el-table-column type="expand">
				<template slot-scope="props">
					<el-form label-position="left" inline class="demo-table-expand">
						<el-form-item label="Appsecret：">
							<span>{{ props.row.appsecret }}</span>
						</el-form-item>
						<el-form-item label="Encodingaeskey：">
							<span>{{ props.row.encodingaeskey }}</span>
						</el-form-item>
						<el-form-item label="接口配置URL：">
							<span>{{ props.row.url }}</span>
						</el-form-item>
						<el-form-item label="Token：">
							<span>{{ props.row.token }}</span>
						</el-form-item>
					</el-form>
				</template>
			</el-table-column>
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="wechatid" label="微信号" width="180">
			</el-table-column>
			<el-table-column prop="name" label="公众号名称" width="200">
			</el-table-column>
			<el-table-column prop="appid" label="APPID">
			</el-table-column>
			<el-table-column prop="status" label="状态" width="80">
				<template slot-scope="scope">
					<span v-if="scope.row.status==1" class="active">使用中</span>
					<span v-else class="nactive">未使用</span>
				</template>
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="info" size="middle" v-if="scope.row.status==1" disabled>使用</el-button>
					<el-button type="primary" size="middle" v-else @click.stop="use(scope.row)">使用</el-button>	
					<el-button type="success" size="middle"  @click.stop="add(scope.row)"><i class="el-icon-edit"></i></el-button>
					<el-button type="danger" size="middle" @click.stop="del(scope.row)"><i class="el-icon-delete"></i></el-button>
					<el-button type="primary" class="addPublic" @click="getMenu" v-if="scope.row.status==1">重置数据</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--添加的弹框-->
		<el-dialog :title="title" :visible.sync="dialogVisible" width="640px" top="5vh" :close-on-click-modal="false">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px"  status-icon>
				<el-form-item label="微信号" prop="wechatid">
					<el-input v-model="ruleForm.wechatid"></el-input>
				</el-form-item>
				<el-form-item label="公众号名称" prop="name">
					<el-input v-model="ruleForm.name"></el-input>
				</el-form-item>
				<el-form-item label="Appid" prop="appid">
					<el-input v-model="ruleForm.appid"></el-input>
				</el-form-item>
				<el-form-item label="Appsecret" prop="appsecret">
					<el-input v-model="ruleForm.appsecret"></el-input>
				</el-form-item>
				<el-form-item label="Token" prop="token">
					<el-input v-model="ruleForm.token"></el-input>
				</el-form-item>
				<el-form-item label="Encodingaeskey" prop="encodingaeskey">
					<el-input v-model="ruleForm.encodingaeskey"></el-input>
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
				publicConfig: [],
				loading: true,
				loading2: false,
				dialogVisible: false,
				ruleForm: {
					wechatid: '',
					name: '',
					appid: '',
					appsecret: '',
					token: '',
					encodingaeskey: ''
				},
				addOrEdit: -1, //区别是新增还是编辑 -1 新增 id 编辑
				title: "添加公众号",
				rules: {
					wechatid: [{
						trigger: 'blur',
						required: true,
						message: '请输入微信号'
					}],
					name: [{
						trigger: 'blur',
						required: true,
						message: '请输入公众号名称'
					}],
					appid: [{
						trigger: 'blur',
						required: true,
						message: '请输入appid'
					}],
					appsecret: [{
						trigger: 'blur',
						required: true,
						message: '请输入appsecret'
					}],
					token: [{
						trigger: 'blur',
						required: true,
						message: '请输入token'
					}]
				}
			}
		},
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'configure');
				this.getconfigInfo();

			});
		},
		methods: {
			getMenu() { //获取菜单
				this.$confirm('是否要从微信服务器拉取菜单')
					.then(_ => {
						let loading = this.$loading({
							text: "拼命拉取中..."
						});
						this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Wechat/getMenu.html').then(res => {
							if(res.status == 1) {
								this.getconfigInfo();
								this.$message.success(res.msg);
							} else if(res.status == 2) {
								this.$router.push({
									name: 'login',
									path: '/login'
								});
							} else {
								this.$message.error(res.msg);
							}
							loading.close();
						});
					}).catch(_ => {});
			},
			//使用操作
			use(row) {
				this.$confirm('是否切换到 ' + row.name)
					.then(_ => {
						let data = {
							id: row.id
						}
						this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Config/changeAccount.html', data).then(res => {
							if(res.status == 1) {
								this.$message.success(res.msg);
								this.getconfigInfo();
								this.$emit('nowPublic', row.name);
								sessionStorage.setItem("name", row.name);
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
			// 添加公众号
			add(row) {
				this.dialogVisible = true;
				if(row != -1) {
					this.addOrEdit = row.id; //编辑
					this.title = "编辑公众号";
					this.ruleForm=row;
					this.ruleForm = {
						wechatid: row.wechatid,
						name: row.name,
						appid: row.appid,
						appsecret: row.appsecret,
						token: row.token,
						encodingaeskey: row.encodingaeskey
					}
				} else {
					this.addOrEdit = -1; //新增
					this.title = "添加公众号";
					this.ruleForm = {
						wechatid: '',
						name: '',
						appid: '',
						appsecret: '',
						token: '',
						encodingaeskey: ''
					}
				}
			},
			//提交信息
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading2 = true;
						var data = {
								name: this.ruleForm.name,
								appid: this.ruleForm.appid,
								appsecret: this.ruleForm.appsecret,
								token: this.ruleForm.token,
								encodingaeskey: this.ruleForm.encodingaeskey,
								wechatid: this.ruleForm.wechatid,
								id: this.addOrEdit
							}
						if(this.addOrEdit != -1) {  //编辑
							data.id=this.addOrEdit
							this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Config/updateConfig.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getconfigInfo();
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
							this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Config/addconfig.html', data).then(res => {
								this.loading2 = false;
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
									this.getconfigInfo();
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
			//获取列表
			getconfigInfo() {
				this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Config/index.html').then(res => {
					this.loading = false
					if(res.status == 1) {
						let flag = true;
						this.publicConfig = res.configlist;
						this.publicConfig.forEach((item, index) => {
							if(item.status == 1) {
								this.$emit('nowPublic', item.name);
								sessionStorage.setItem("name", item.name);
								flag = false;
							}
						})
						if(flag) {
							this.$emit('nowPublic', '暂时没有哦');
						}
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
			//删除
			del(row) {
				this.$confirm('是否删除 ' + row.name)
					.then(_ => {
						let data = {
							id: row.id
						}
						this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Config/delConfig.html', data).then(res => {
							if(res.status == 1) {
								this.$message.success(res.msg);
								this.getconfigInfo();
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
		}
	}
</script>
<style scoped>
	.addPublic {
		margin-bottom: 20px;
	}
	
	.active {
		color: #F56C6C;
	}
	
	.nactive {
		color: #909399
	}
	.demo-table-expand .el-form-item {
		margin:0;
		color:#f78989;
		width: 100%;
	}
</style>