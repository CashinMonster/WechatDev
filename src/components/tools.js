import axios from 'axios'  //axios
//var test="/Wechatadmin/WechatDevApi/public/index.php";  //正式
var test="/WechatDevApi/public";   //IP访问
export default {
	getAxio(url,data){
		return axios({
				url: url,
				method: 'post',
				data: data
			})
			.then(res => {	
				return res.data;
			})
	},
	test:test
}