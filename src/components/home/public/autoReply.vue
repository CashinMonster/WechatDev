<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 添加自动回复</el-button>
		<el-table :data="autoReplay" border style="width: 100%;" v-loading="loading" >
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="keyword" label="关键字" width="200">
			</el-table-column>
			<el-table-column prop="reply" label="回复内容" width="450">
			</el-table-column>
			<el-table-column prop="eventtype" label="回复场景" width="110" :filters="[{ text: '关键字回复', value: '关键字回复' },{ text: '扫码回复', value: '扫码回复' }, { text: '欢迎语', value: '欢迎语' },{ text: '默认回复', value: '默认回复' }]" :filter-method="filterTag" filter-placement="bottom-end">
				<template slot-scope="scope">
					<el-tag>{{scope.row.eventtype}}</el-tag>
				</template>
			</el-table-column>
			<el-table-column prop="msgtype" label="回复类型" width="80">
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="success" size="middle" @click.stop="add(scope.row)"><i class="el-icon-edit"></i></el-button>
					<el-button type="danger" size="middle" @click.stop="del(scope.row)"><i class="el-icon-delete"></i></el-button>
					<!--二维码展示-->
					<el-button slot="reference" type="primary" size="middle" v-if="scope.row.eventtype=='扫码回复'" @click.stop="lookqrCode(scope.row)"><i class="el-icon-search"></i></el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage4" :page-sizes="[10, 20, 30, 40]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="40">
		</el-pagination>-->
		<!--弹框-->
		<el-dialog :title="title" :visible.sync="dialogVisible" width="640px" top="8vh" :close-on-click-modal="false">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" status-icon>
				<el-form-item label="回复场景">
					<el-radio-group size="mini" v-model="replyRadio" @change="changeReplyRadio">
						<el-radio border label="1">关键字回复</el-radio>
						<el-radio border label="2">扫码回复</el-radio>
						<el-radio border label="3">欢迎语</el-radio>
						<el-radio border label="4">默认回复</el-radio>
					</el-radio-group>
				</el-form-item>
				<div v-if="codeType==0">
					<div style="overflow: hidden;">
						<el-col :span="15">
							<el-form-item label="二维码类型" v-if="replyRadio==2">
								<el-radio-group size="mini" v-model="timeRadio">
									<el-radio border label="1">永久二维码</el-radio>
									<el-radio border label="2">临时二维码</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="9">
							<div v-if="timeRadio==2 && replyRadio==2" style="width: 150px;margin-top:5px;">
								<el-tooltip class="item" effect="dark" content="临时二维码最长有效期30天" placement="bottom">
									<input class="nativeInput" v-model="expire" @blur="changeVal"></input>
								</el-tooltip>
								<span>天后失效</span>

							</div>
						</el-col>
					</div>
					<el-form-item prop="keyword" label="关键字" v-if="replyRadio!=3 && replyRadio!=4">
						<el-input v-model="ruleForm.keyword"></el-input>
					</el-form-item>
				</div>
				<div v-else>
					<div style="overflow: hidden;">
						<el-col :span="15">
							<el-form-item label="二维码类型" v-if="replyRadio==2">
								<el-radio-group size="mini" v-model="timeRadio">
									<el-radio border label="1" disabled>永久二维码</el-radio>
									<el-radio border label="2" disabled>临时二维码</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
						<el-col :span="9">
							<div v-if="timeRadio==2 && replyRadio==2" style="width: 150px;margin-top:5px;">
								<el-input size="small" v-model="expire" :disabled="true"></el-input>
							</div>
						</el-col>
					</div>
					<el-form-item prop="keyword" label="关键字" v-if="replyRadio!=3 && replyRadio!=4">
						<el-input v-model="ruleForm.keyword" :disabled="true"></el-input>
					</el-form-item>
				</div>
				<el-form-item label="回复类型">
					<el-radio-group size="mini" v-model="radio">
						<el-radio border label="1">文字</el-radio>
						<!--<el-radio border label="2">图片</el-radio>
						<el-radio border label="3">图文</el-radio>-->
					</el-radio-group>
				</el-form-item>

				<el-form-item prop="reply" label="回复内容" v-if="radio==1">
					<el-input v-model="ruleForm.reply" type="textarea" :autosize="{ minRows: 6, maxRows: 12}"></el-input>
				</el-form-item>

			</el-form>
			<span slot="footer" class="dialog-footer">
			    <el-button type="primary"  @click="submitForm('ruleForm')" v-loading="loading2">{{save}}</el-button>
  			</span>
		</el-dialog>
		<!--显示二维码-->
		<el-dialog :title="qrCodeTitle" :visible.sync="dialogqrCode" width="280px">
			<img :src="qrCodeInfo.imgurl" style="width:200px;height: 200px; display: block; margin:0 auto;" />
			<span style="padding-right: 10px;">{{qrCodeInfo.codetype}}</span> 
			<span v-if="qrCodeInfo.expire>0" style="color:red;display: block; ">截止时间 :{{qrCodeInfo.endtime}}</span>
		</el-dialog>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				autoReplay: [],
				loading: true,
				loading2: false,
				radio: "1",
				replyRadio: "1",
				timeRadio: "1",
				dialogVisible: false,
				dialogqrCode: false,
				qrCodeInfo:{},
				qrCodeTitle: '',
				save: "保 存",
				title: "",
				addOrEdit: -1,
				codeType: 0,
				expire: 30,
				ruleForm: {
					keyword: '',
					reply: ''
				},
				rules: {
					keyword: [{
						trigger: 'blur',
						required: true,
						message: '请输入关键字'
					}],
					reply: [{
						trigger: 'blur',
						required: true,
						message: '请输入回复内容'
					}]
				}
			}
		},
		watch: {
			expire: {
				handler: function(val) {
					var val = String(val)
					this.expire = val.replace(/[^\d]/g, '');
					if(val > 30) {
						this.expire = 30
					} else if(val < 0) {
						this.expire = 1
					}
				},
				deep: true

			}
		},
		methods: {
			lookqrCode(row) {
				this.qrCodeTitle = row.keyword + "对应的二维码";
				this.dialogqrCode = true;
				
				if(row.eventtype=="扫码回复"){
					if(row.expire==0){
						row.codetype="永久二维码";
					}else{
						row.codetype="临时二维码";
					}
				}
				this.qrCodeInfo = row
			},
			changeVal() {
				if(this.expire == '') {
					this.expire = 30
				}
			},
			changeReplyRadio(val) {
				if(val == 2) {
					this.save = "生成二维码";
				} else {
					this.save = "保 存";
				}
				if(this.addOrEdit != -1) {
					if(val == 1) {
						this.codeType = 0
					} else {
						this.codeType = 1
					}

				}
			},
			getReplyInfo() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/index.html').then(res => {
					this.loading = false
					if(res.status == 1) {
						res.replylist.forEach((item, index) => {
							if(item.msgtype == "text") {
								item.msgtype = "文字"
							}
							if(item.eventtype == 1) {
								if(item.keyword == "DEFAULT_REPLY") {
									item.eventtype = "默认回复"
								} else {
									item.eventtype = "关键字回复"
								}
							} else if(item.eventtype == 13) {
								item.eventtype = "扫码回复"
							} else if(item.eventtype == 11) {
								item.eventtype = "欢迎语"
							}
						})
						this.autoReplay = res.replylist

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
			filterTag(value, row) {
				return row.eventtype === value;
			},
			del(row) {
				this.$confirm('是否删除 ' + row.keyword + ' 这个关键字')
					.then(_ => {
						let data = {
							id: row.id
						}
						this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/delReply.html', data).then(res => {
							if(res.status == 1) {
								this.$message.success(res.msg);
								this.getReplyInfo();
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
			add(row) {
				this.dialogVisible = true
				if(row == -1) {
					this.addOrEdit = -1; //新增
					this.title = "添加自动回复";
					this.codeType = 0;
					this.ruleForm = {
						keyword: '',
						reply: ''
					};
					this.expire = 30;
					this.replyRadio = "1";
					this.timeRadio = "1";
					this.radio = "1";
					this.save = "保 存";
				} else {
					this.addOrEdit = row.id; //新增
					this.title = "编辑自动回复";
					let data = {
						id: row.id
					};
					this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/getReplyInfo.html', data).then(res => {
						if(res.status == 1) {
							if(res.replyinfo.msgtype == "text") {
								this.radio = "1"
							}
							this.codeType = 0;
							if(res.replyinfo.eventtype == 1) {
								if(res.replyinfo.keyword == "DEFAULT_REPLY") {
									this.replyRadio = "4"
								} else {
									this.replyRadio = "1"
								}
							} else if(res.replyinfo.eventtype == 13) {
								if(res.replyinfo.qrtype == 1) {
									this.timeRadio = "2"
									this.expire = res.replyinfo.expire
								} else {
									this.timeRadio = "1"
									this.expire = 0
								}
								this.replyRadio = "2"
								this.codeType = 1;
							} else if(res.replyinfo.eventtype == 11) {
								this.replyRadio = "3"
							}
							this.ruleForm = res.replyinfo;
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
			},
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading2 = true
						var data = {
							keyword: this.ruleForm.keyword,
							reply: this.ruleForm.reply,
							status: 1
						}
						//回复类型
						if(this.radio == 1) {
							data.msgtype = "text"
						} else if(this.radio == 2) {
							data.msgtype = "image"
						} else if(this.radio == 3) {
							data.msgtype = "imageText"
						}
						//回复场景
						if(this.replyRadio == 1) {
							data.eventtype = 1
						} else if(this.replyRadio == 2) {
							data.eventtype = 13
							//二维码类型
							if(this.timeRadio == 1) {
								data.expire = 0
								data.qrtype = 2
							} else if(this.timeRadio == 2) {
								data.expire = this.expire
								data.qrtype = 1
							}
						} else if(this.replyRadio == 3) {
							data.eventtype = 11
						} else if(this.replyRadio == 4) {
							data.eventtype = 1
							data.keyword = "DEFAULT_REPLY"
						}

						if(this.addOrEdit == -1) { //新增
							if(this.replyRadio == 2) { //选择二维码，要先生成二维码
								var data2 = {
									keyword: this.ruleForm.keyword
								};
								if(this.timeRadio == 1) {
									data2.expire = 0
									data2.qrtype = 2
								} else if(this.timeRadio == 2) {
									data2.expire = this.expire
									data2.qrtype = 1
								}
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Wechat/createQRcode.html', data2).then(res => {
									if(res.status == 1) {
										data.imgurl = res.imgurl;
										this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/addReply.html', data).then(res => {
											this.loading2 = false
											if(res.status == 1) {
												this.$message.success(res.msg);
												this.getReplyInfo();
												this.$refs[formName].resetFields();
												this.dialogVisible = false;
												// 显示二维码
												this.qrCodeTitle = data.keyword + "对应的二维码";
												this.dialogqrCode = true;
												if(data.eventtype==13){
													if(data.expire==0){
														data.codetype="永久二维码";
													}else{
														data.codetype="临时二维码";
														data.endtime=res.info.endtime;
													}
												}
												this.qrCodeInfo = data
											} else if(res.status == 2) {
												this.$router.push({
													name: 'login',
													path: '/login'
												});
											} else {
												this.$message.error(res.msg);
											}
										});
									} else if(res.status == 2) {
										this.$router.push({
											name: 'login',
											path: '/login'
										});
									} else {
										this.$message.error(res.msg);
									}
								});
							} else { //选择非二维码
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/addReply.html', data).then(res => {
									this.loading2 = false
									if(res.status == 1) {
										this.$message.success(res.msg);
										this.getReplyInfo();
										this.$refs[formName].resetFields();
										this.dialogVisible = false;
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
						} else { //编辑
							data.id = this.addOrEdit;
							if(this.replyRadio == 2) {
								if(this.timeRadio == 1) {
									data.expire = 0
									data.qrtype = 2
								} else if(this.timeRadio == 2) {
									data.expire = this.expire
									data.qrtype = 1
								}
							}

							this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/editReply.html', data).then(res => {
								this.loading2 = false
								if(res.status == 1) {
									this.$message.success(res.msg);
									this.getReplyInfo();
									this.$refs[formName].resetFields();
									this.dialogVisible = false;
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
				})
			},//分页
			handleSizeChange(val) {
				console.log(`每页 ${val} 条`);
			},
			handleCurrentChange(val) {
				console.log(`当前页: ${val}`);
			}
		},
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'autoReply');
				this.getReplyInfo();
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
	
	.nativeInput {
		width: 48px;
		height: 24px;
		border-radius: 4px;
		background: none;
		border: 1px solid #409EFF;
		text-align: center;
		margin-top: 2px
	}
	.el-pagination{
		float: right;
		margin-top:20px;
	}
</style>