<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 一级菜单</el-button>
		<el-button type="primary" class="addPublic" @click="putMenu" style="float: right;">保存修改</el-button>
		<el-table :data="menuInfo" style="width: 100%;margin-top:20px; min-width: 1160px;" v-loading="loading" :row-key="getRowKeys" :expand-row-keys="expands" @expand-change="expandChange">
			<el-table-column type="expand">
				<template slot-scope="props">
					<el-table :data="props.row.chmenu" :show-header="false" class="childrenMenu">
						<el-table-column type="index" width="58" label="ID">
						</el-table-column>
						<el-table-column prop="buttonname" label="菜单名" width="200">
						</el-table-column>
						<el-table-column prop="type" label="功能" width="200">
						</el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="success" size="middle" @click="add(scope.row,0)"><i class="el-icon-edit"></i></el-button>
								<el-button type="danger" size="middle" @click="del(scope.row)"><i class="el-icon-delete"></i></el-button>
							</template>
						</el-table-column>
					</el-table>
				</template>
			</el-table-column>
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="buttonname" label="菜单名" width="200">
			</el-table-column>
			<el-table-column prop="type" label="功能" width="200">
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="success" size="middle" @click="add(scope.row,1)"><i class="el-icon-edit"></i></el-button>
					<el-button type="danger" size="middle" @click="del(scope.row)"><i class="el-icon-delete"></i></el-button>
					<el-button type="primary" size="middle" @click="add(scope.row)" v-if="scope.row.type=='显示子菜单'"><i class="el-icon-plus"></i>子菜单</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!--添加的弹框-->
		<el-dialog :title="title" :visible.sync="dialogVisible" width="640px" top="5vh" :close-on-click-modal="false">
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" status-icon>
				<el-form-item :label="isParentText" prop="buttonname">
					<el-input v-model="ruleForm.buttonname"></el-input>
				</el-form-item>
				<el-form-item label="菜单功能" v-if="isEditParent==1">
					<el-radio-group size="mini" v-model="radio" @change="getRadio">
						<el-radio border label="1" v-if="isParent==-1">显示子菜单</el-radio>
						<el-radio border label="2">跳转网页</el-radio>
						<el-radio border label="3">跳转图文消息</el-radio>
						<el-radio border label="4">跳转小程序</el-radio>
					</el-radio-group>
				</el-form-item>
				<div v-if="isEditParent==1">
					<div v-if="radio==1">
					</div>
					<div v-else-if="radio==2">
						<el-form-item label="链接地址" prop="url" key="1">
							<el-input v-model="ruleForm.url"></el-input>
						</el-form-item>
					</div>
					<div v-else-if="radio==3">
						<el-form-item label="选择图文列表" prop="imageText" key="2">
							<el-autocomplete v-model="ruleForm.imageText"   :fetch-suggestions="querySearch" placeholder="请输入内容" @select="handleSelect" style="width: 100%;">
							<template slot-scope="{ item }">
								<div class="title">{{ item.title }}</div>
							</template>
							</el-autocomplete>
						</el-form-item>
					</div>
					<div v-else-if="radio==4">
						<el-form-item label="小程序APPID" prop="key" key="3">
							<el-input v-model="ruleForm.key"></el-input>
						</el-form-item>
						<el-form-item label="小程序路径" prop="url2">
							<el-input v-model="ruleForm.url2"></el-input>
						</el-form-item>
						<el-form-item label="网页地址" prop="miniprogramurl">
							<el-input v-model="ruleForm.miniprogramurl"></el-input>
						</el-form-item>
					</div>
				</div>
				<el-form-item label="排序">
					<el-input v-model="ruleForm.sort"></el-input>
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
			var validateButtonname = (rule, value, callback) => {
				let reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
				let len = value.replace(/[^\x00-\xff]/g, "aa").length;
				if(value === '') {
					callback(new Error('请输入菜单名称'));
				} else if(this.isParent == -1 && len > 8) {
					callback(new Error('一级菜单不能超过4个汉字或者8个字母或数字'));

				} else if(this.isParent != -1 && len > 16) {
					callback(new Error('子菜单不能超过8个汉字或者16个字母或数字'));
				} else {
					callback();
				}
			};
			var validateUrl = (rule, value, callback) => {
				if(value === '') {
					if(this.radio == "2") {
						callback(new Error('请输入链接地址'));
					} else if(this.radio == "4") {
						callback(new Error('请输入小程序路径'));
					}
				} else {
					callback();
				}
			};
			return {
				loading: true,
				loading2: false,
				menuInfo: [],
				title: '添加一级菜单',
				dialogVisible: false,
				radio: "1",
				isParent: -1, //是否是父菜单  
				isEditParent: 1, //是否显示菜单功能
				EditId: 0, //编辑时传入的ID
				isParentText: "一级菜单",
				// 获取row的key值
				getRowKeys(row) {
					return row.id;
				},
				// 要展开的行，数值的元素是row的key值
				expands: [],
				restaurants: [], //图文列表
				ruleForm: {
					buttonname: '',
					miniprogramurl: '',
					key: '', // appID
					url: '', //链接地址
					url2: '', //小程序路径
					url3: '', //图文消息
					sort: '',
					imageText: ''
				},
				rules: {
					buttonname: [{
						trigger: 'change',
						required: true,
						validator: validateButtonname
					}],
					key: [{
						trigger: 'blur',
						required: true,
						message: '请输入小程序APPID'
					}],
					miniprogramurl: [{
						trigger: 'blur',
						required: true,
						message: '请输入网页地址'
					}],
					url2: [{
						trigger: 'blur',
						required: true,
						validator: validateUrl
					}],
					url: [{
						trigger: 'blur',
						required: true,
						validator: validateUrl
					}],
					imageText: [{
						trigger: 'change',
						required: true,
						message: '请选择跳转的图文'
					}]

				}
			}
		},
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'menu');
				this.getMenuInfo();
				if(sessionStorage.getItem("name")) {
					this.$emit('nowPublic', sessionStorage.getItem("name"));
				} else {
					this.$emit('nowPublic', '暂时没有哦');
				}

			});
		},
		methods: {
			querySearch(queryString, cb) {
				var restaurants = this.restaurants;
				var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return(restaurant) => {
					return(restaurant.title.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
				};
			},
			getImgText() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Wechat/getNews.html').then(res => {
					if(res.status == 1) {
						if(res.list.length==0){
						     this.$message.error("还没有发表过图文消息哦");
					    }else{
					    	this.restaurants = res.list;
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
			getRadio(val){
				if(val==3){
					this.getImgText();	
				}
			},
			handleSelect(item) {
				this.ruleForm.imageText = item.title;
				this.ruleForm.url3 = item.media_id;

			},
			expandChange(row) {
				let index = this.expands.indexOf(row.id);
				if(index > -1) {
					this.expands.splice(index, 1);
				} else {
					this.expands.push(row.id)
				}
			},
			//获取列表
			getMenuInfo() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/index.html').then(res => {
					this.loading = false
					if(res.status == 1) {
						res.menulist.forEach((item, index) => {
							if(item.type == "view") {
								item.type = "跳转网页";
							} else if(item.type == "show") {
								item.type = "显示子菜单";
							} else if(item.type == "media_id") {
								item.type = "跳转图文消息";
							} else if(item.type == "miniprogram") {
								item.type = "跳转小程序";
							}
							item.chmenu.forEach((item, index) => {
								if(item.type == "view") {
									item.type = "跳转网页";
								} else if(item.type == "show") {
									item.type = "显示子菜单";
								} else if(item.type == "media_id") {
									item.type = "跳转图文消息";
								} else if(item.type == "miniprogram") {
									item.type = "跳转小程序";
								}
							})
						});
						this.menuInfo = res.menulist;
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
			add(index, type) {
				this.EditId = 0;
				this.dialogVisible = true;
				this.ruleForm = {
					buttonname: '',
					miniprogramurl: '',
					key: '',
					url: '',
					url2: '',
					url3: '',
					sort: '',
					imageText: ''
				}
				if(index == -1) {
					this.isEditParent = 1;
					this.isParent = -1;
					this.radio = "1";
					this.isParentText = "一级菜单";
					this.title = "添加一级菜单";

				} else {
					this.isEditParent = 1;
					this.isParent = index.id; //添加子菜单，isPArent是 父菜单的 ID
					this.radio = "2";
					this.isParentText = "子菜单";
					this.title = "添加" + index.buttonname + "下的子菜单";
				}
				if(type != undefined) {
					this.EditId = index.id;
					if(type == 1) { //编辑父菜单
						this.title = "编辑一级菜单";
						this.isParentText = "一级菜单";
						this.isParent = -1;
						if(index.type == "显示子菜单") {
							this.isEditParent = -1;
						} else {
							this.isEditParent = 1;
						}

					} else if(type == 0) { //编辑子菜单

						this.isEditParent = 1;
						this.title = "编辑" + index.buttonname;
						this.isParent = index.parentid; //编辑子菜单，isPArent是 父菜单的 ID
					}

					let data = {
						id: index.id
					};
					this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/getMenuInfo.html', data).then(res => {
						if(res.status == 1) {
							this.ruleForm = res.menuinfo;
							if(res.menuinfo.type == "show") {
								this.radio = "1"
							} else if(res.menuinfo.type == "view") {
								this.radio = "2"
								this.ruleForm.url2 = ""
								this.ruleForm.url3 = ""
								this.ruleForm.key = ""
								this.ruleForm.imageText = ""
							} else if(res.menuinfo.type == "media_id") {
								this.radio = "3"
								this.ruleForm={
									buttonname: res.menuinfo.buttonname,
									miniprogramurl: '',
									key: '', 
									url: '', 
									url2: '', 
									url3: res.menuinfo.media_id, 
									sort: res.menuinfo.sort,
									imageText: res.menuinfo.key
								},
								this.getImgText();
							} else if(res.menuinfo.type == "miniprogram") {
								this.radio = "4"
								this.ruleForm.url2 = res.menuinfo.url
								this.ruleForm.url = ""
								this.ruleForm.url3 = ""
								this.ruleForm.imageText = ""
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

				}

			},
			del(row) {
				let data = {
					id: row.id
				}
				this.$confirm('是否删除 ' + row.buttonname)
					.then(_ => {
						this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/delMenu.html', data).then(res => {
							if(res.status == 1) {
								this.getMenuInfo();
								this.$message.success(res.msg);
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
			
			putMenu() { //推送菜单
				this.$confirm('是否要把本地菜单推送到微信服务器')
					.then(_ => {
						let loading = this.$loading({
							text: "拼命推送中..."
						});
						this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Wechat/createMenu.html').then(res => {
							if(res.status == 1) {
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
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(!valid) {
						return false;
					} else {
						this.loading2 = true;
						var data = {
							buttonname: this.ruleForm.buttonname,
							sort: this.ruleForm.sort,
							status: 1
						}
						if(this.isParent == -1) { //添加一级菜单
							if(this.EditId != 0) {
								data.id = this.EditId;
							}
							data.parentid = 0;
							if(this.radio == 1) {
								data.type = "show";
							} else if(this.radio == 2) {
								data.type = "view";
								data.url = this.ruleForm.url;
							} else if(this.radio == 3) {
								data.type = "media_id";
								data.url = this.ruleForm.url3;
								data.key = this.ruleForm.imageText;
							} else if(this.radio == 4) {
								data.type = "miniprogram";
								data.url = this.ruleForm.url2;
								data.key = this.ruleForm.key;
								data.miniprogramurl = this.ruleForm.miniprogramurl;
							}
							if(this.EditId == 0) {
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/addMenu.html', data).then(res => {
									this.loading2 = false;
									if(res.status == 1) {
										this.getMenuInfo();
										this.$message.success(res.msg);
										this.dialogVisible = false;
										this.$refs[formName].resetFields();
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
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/editMenu.html', data).then(res => {
									this.loading2 = false;
									if(res.status == 1) {
										this.getMenuInfo();
										this.$message.success(res.msg);
										this.dialogVisible = false;
										this.$refs[formName].resetFields();
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
						} else { //添加子菜单
							data.parentid = this.isParent;
							if(this.EditId != 0) {
								data.id = this.EditId;
							}
							if(this.radio == 2) {
								data.type = "view";
								data.url = this.ruleForm.url;
							} else if(this.radio == 3) {
								data.type = "media_id";
								data.url = this.ruleForm.url3;
								data.key = this.ruleForm.imageText;
							} else if(this.radio == 4) {
								data.type = "miniprogram";
								data.url = this.ruleForm.url2;
								data.key = this.ruleForm.key;
								data.miniprogramurl = this.ruleForm.miniprogramurl;
							}
							if(this.EditId == 0) {
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/addMenu.html', data).then(res => {
									this.loading2 = false;
									if(res.status == 1) {
										this.getMenuInfo();
										this.$message.success(res.msg);
										this.dialogVisible = false;
										this.$refs[formName].resetFields();
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
								this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Menu/editMenu.html', data).then(res => {
									this.loading2 = false;
									if(res.status == 1) {
										this.getMenuInfo();
										this.$message.success(res.msg);
										this.dialogVisible = false;
										this.$refs[formName].resetFields();
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
					}
				})
			}
		}
	}
</script>
<style scoped>
	.childrenMenu {
		width: 100%;
		margin: 0;
	}
	
	.el-table__expanded-cell {
		margin: 0 !important;
	}
</style>