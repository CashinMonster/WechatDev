<template>
	<el-form :model="ruleForm" label-width="60px" status-icon :rules="rules" ref="ruleForm">
		<h3 class="title">微信开发者后台</h3>
		<el-form-item label="账号" prop="username">
			<el-input v-model="ruleForm.username"></el-input>
		</el-form-item>
		<el-form-item label="密码" prop="password">
			<el-input v-model="ruleForm.password" type="password" @keyup.native.enter="submitForm('ruleForm')"></el-input>
		</el-form-item>
		<el-form-item>
			<el-checkbox v-model="checked">记住密码</el-checkbox>
		</el-form-item>
		<el-button type="primary" style="width: 100%;" @click="submitForm('ruleForm')" :loading="loading">登录</el-button>
	</el-form>
</template>
<script>
	export default {
		data() {
			return {
				checked: true,
				ruleForm: {
					username: '',
					password: ''
				},
				rules: {
					username: [{
						trigger: 'blur',
						required: true,
						message: '请输入账号'
					}],
					password: [{
						trigger: 'blur',
						required: true,
						message: '请输入密码'
					}]
				},
				loading: false
			};
		},
		mounted() {
			this.$nextTick(function() {
				if(localStorage.getItem("password")) {
					this.ruleForm = JSON.parse(localStorage.getItem("password"));
				}
			});
		},
		methods: {
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading = true;
						let data = {
							username: this.ruleForm.username,
							pwd: this.ruleForm.password
						}
						this.tools.getAxio(process.env.API_HOST+this.tools.test+'/index/Login/userLogin.html', data).then(res => {
							this.loading = false;
							if(res.status == 1) {
								if(this.checked) {
									localStorage.setItem("password", JSON.stringify(this.ruleForm));
								}else {
									if(localStorage.getItem("password")) {
										localStorage.removeItem("password");
									}
								}
								sessionStorage.removeItem("name");
								this.$router.push({
									name: 'configure',
									path: '/configure'
								});
							} else {
								this.$message.error(res.msg);
							}
						});
					}
				});
			}
		}
	}
</script>

<style scoped="scoped">
	.el-form {
		border-radius: 5px;
		-moz-border-radius: 5px;
		background-clip: padding-box;
		margin: 180px auto;
		width: 350px;
		padding: 35px 35px 15px;
		background: #fff;
		border: 1px solid #eaeaea;
		box-shadow: 0 0 25px #cac6c6;
	}
	
	.title {
		margin: 0 auto 40px;
		text-align: center;
		color: #505458;
	}
</style>