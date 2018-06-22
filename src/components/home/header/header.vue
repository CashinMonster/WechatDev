<template>
	<el-container>
		<el-header>
			<el-col class="header">
				<el-col class="logo" :span="4" :style="{width: width}">{{logo}}</el-col>
				<el-col :span="10">
					<div class="tools" @click="change">
						<i :class="icon"></i>
					</div>
					<div class="nowPublic">
						当前公众号 : <span>{{nowPublic}}</span>
					</div>
				</el-col>
				<el-col :span="3" class="information">
					<el-dropdown trigger="click" style="cursor: pointer;">
						<span class="el-dropdown-link">
						    {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
						  </span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item @click.native="loginOut">
								退出登录
							</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</el-col>
			</el-col>
		</el-header>
		<el-container class="main-container">
			<el-menu :collapse="isCollapse" :router="router" :collapse-transition="collapseTransition" :default-active="activeIndex" active-text-color="#fff" class="el-menu-vertical-demo">
				<el-submenu index="1">
					<template slot="title">
						<i class="el-icon-setting"></i>
						<span>公众号管理</span>
					</template>
					<el-menu-item-group>
						<el-menu-item index="configure">公众号配置</el-menu-item>
						<el-menu-item index="menu">菜单栏</el-menu-item>
						<el-menu-item index="autoReply">自动回复</el-menu-item>
					</el-menu-item-group>
				</el-submenu>
				<!--<el-submenu index="2">
					<template slot="title">
						<i class="el-icon-upload"></i>
						<span>消息推送</span>
					</template>
					<el-menu-item-group>
						<el-menu-item index="template">模板消息</el-menu-item>
					</el-menu-item-group>
				</el-submenu>-->
				<el-submenu index="3">
					<template slot="title">
						<i class="el-icon-menu"></i>
						<span>系统管理</span>
					</template>
					<el-menu-item-group>
						<el-menu-item index="systemUser">系统用户</el-menu-item>
						<el-menu-item index="roleManage">角色管理</el-menu-item>
						<!--<el-menu-item index="3-2">系统日志</el-menu-item>-->
					</el-menu-item-group>
				</el-submenu>
			</el-menu>
			<el-main>
				<router-view @nowPublic="getnowPublic" @activeIndex="getactiveIndex" />
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default {
		data() {
			return {
				router: true,
				isCollapse: false,
				collapseTransition: true,
				width: '200px',
				activeIndex: 'configure',
				username: '',
				nowPublic: '',
				icon: "el-icon-d-arrow-left",
				logo: "微信开发者后台"
			};
		},
		mounted() {
			this.$nextTick(function() {
				if(localStorage.getItem("password")) {
					this.username = JSON.parse(localStorage.getItem("password")).username
				} else {
					this.$router.push({
						name: 'login',
						path: '/login'
					});
				}
			});
		},
		methods: {
			change() {
				if(this.isCollapse) {
					this.width = "200px";
					this.icon = "el-icon-d-arrow-left";
					this.logo = "微信开发者后台";
				} else {
					this.width = "64px";
					this.icon = "el-icon-d-arrow-right";
					this.logo = "微信";
				}
				this.isCollapse = !this.isCollapse;
			},
			loginOut() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Login/logout.html').then(res => {
					if(res.status == 1) {
						this.$router.push({
							name: 'login',
							path: '/login'
						});
					} else {
						this.$message.error(res.msg);
					}
				});
			},
			getnowPublic(val) {
				this.nowPublic = val
			},
			getactiveIndex(val) {
				this.activeIndex = val
			}
		}
	}
</script>

<style scoped>
	.el-menu-vertical-demo:not(.el-menu--collapse) {
		width: 200px;
	}
	
	.el-header {
		background-color: #20a0ff;
		color: #333;
		text-align: center;
		line-height: 60px;
		padding: 0;
	}
	
	.el-header .logo {
		border-right: 1px solid #fff;
		color: #fff;
		font-size: 20px;
	}
	
	.tools {
		width: 60px;
		text-align: left;
		padding-left: 5px;
		height: 60px;
		line-height: 60px;
		cursor: pointer;
		color: #fff;
		float: left;
		font-size: 24px;
	}
	
	.information {
		float: right;
	}
	
	.el-dropdown-link {
		color: #fff;
		font-size: 20px;
	}
	
	.el-aside {
		color: #333;
	}
	
	.el-menu {
		background-color: #eef1f6;
		height: 100%;
		border: 0;
	}
	
	.main-container {
		position: absolute;
		top: 60px;
		bottom: 0;
		overflow: hidden;
		width: 100%;
	}
	
	.el-main {
		color: #333;
		flex: 1;
	}
	
	.nowPublic {
		float: left;
		font-size: 16px;
		color: #fff
	}
	
	.nowPublic span {
		color: red
	}
	
	.logo {
		height: 60px;
		transition: all .4s;
	}
	
	.el-menu-item-group .is-active {
		background: #409EFF;
	}
</style>