<template>
	<div class="main">
		<el-button type="primary" class="addPublic" @click="add(-1)"><i class="el-icon-plus"></i> 获取列表</el-button>
		<el-table :data="autoReplay" border style="width: 100%;" v-loading="loading">
			<el-table-column type="index" width="60" label="ID">
			</el-table-column>
			<el-table-column prop="keyword" label="标题" width="200">
			</el-table-column>
			<el-table-column label="操作">
				<template slot-scope="scope">
					<el-button type="success" size="middle" @click="add(scope.row)"><i class="el-icon-edit"></i></el-button>
					<el-button type="danger" size="middle" @click="del(scope.row)"><i class="el-icon-delete"></i></el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				autoReplay: [],
			}
		},
		methods: {
			getReplyInfo() {
				this.tools.getAxio(process.env.API_HOST + this.tools.test + '/index/Autoreply/index.html').then(res => {
					this.loading = false
					if(res.status == 1) {
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
		mounted() {
			this.$nextTick(function() {
				this.$emit('activeIndex', 'template');
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

</style>