
export var objectContext = {
	message_history:[{
		"role": "system",
		"content": "You are Bwaco Chatbot. Please interpret the following user input and convert it into JSON of the form {\"hành_động\":\"\",\"phân_loại\":\"\",\"mã_khách_hàng\":\"\",\"số_điện_thoại\":\"\",\"tên_khách_hàng\":\"\",\"địa_chỉ\":\"\",\"mã_đồng_hồ\":\"\",\"chỉ_số_nước\":\"\",\"tháng\":\"\",\"năm\":\"\",\"trả_lời\":\"\",\"kết_thúc\":\"boolean\",\"số_thứ_tự_trả_lời\":\"\"}. Only return JSON. User input:"
	  }],
	action: "",
	category: "",
	phone_number: "",
	user_id: "",
	user_name: "",
	address: "",
	device_id: "",
	index_value: "",
	month: "",
	year: "",
}

export function clearObjContext(){
	return objectContext = {
		message_history:[{
			"role": "system",
			"content": "You are Bwaco Chatbot. Please interpret the following user input and convert it into JSON of the form {\"hành_động\":\"\",\"phân_loại\":\"\",\"mã_khách_hàng\":\"\",\"số_điện_thoại\":\"\",\"tên_khách_hàng\":\"\",\"địa_chỉ\":\"\",\"mã_đồng_hồ\":\"\",\"chỉ_số_nước\":\"\",\"tháng\":\"\",\"năm\":\"\",\"trả_lời\":\"\",\"kết_thúc\":\"boolean\",\"số_thứ_tự_trả_lời\":\"\"}. Only return JSON. User input:"
		  }],
		action: "",
		category: "",
		phone_number: "",
		user_id: "",
		user_name: "",
		address: "",
		device_id: "",
		index_value: "",
		month: "",
		year: "",
	}
}

export function messageFirst_UserID(_action, _category){
	return {
        "role": "assistant",
		"content": '{"hành_động":"' + _action + '","phân_loại":"' + _category + '","mã_khách_hàng":"","số_điện_thoại":"","tên_khách_hàng":"","địa_chỉ":"","mã_đồng_hồ":"","chỉ_số_nước":"","tháng":"","năm":"","trả_lời":"Anh/chị vui lòng cung cấp mã khách hàng","kết_thúc":"false","số_thứ_tự_trả_lời":"1"}'
	};
}
export function messageSecond_Phone(_user_id){
	return {
        "role": "assistant",
		"content": '{"hành_động":"Cung cấp thông tin khách hàng","phân_loại":"Thông tin khách hàng","mã_khách_hàng":"' + _user_id + 
				   '","số_điện_thoại":"","tên_khách_hàng":"","địa_chỉ":"","mã_đồng_hồ":"","chỉ_số_nước":"","tháng":"","năm":"","trả_lời":"Anh/chị vui lòng cung cấp số điện thoại liên hệ","kết_thúc":"false","số_thứ_tự_trả_lời":"2"}'
	};
}