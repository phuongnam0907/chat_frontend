export const ActionStatus = {
	idle: 0,
	greeting:1,
	say_thanks:2,
	reflect_water_quality:3,
	reflect_water_supply:4,
	request_watch_repair:5,
	request_watch_move_lift:6,
	request_watch_box_secure:7,
	request_pipe_repair:8,
	request_IndexWatch_check_explain: 9,
	request_valve_repair:10,
	request_area_refund:11,
	instruction_payment_methods:12,
	request_invoices:13,
	request_IndexWater_report_input:14,
	instruction_IndexWaterString_input:15,
	explain_bill_period:18,
	request_IndexWater_date:19,
	explain_temporary_calculate:20,
	research_water_price:21,
	explain_business_water_price:22,
	research_water_tax:23,
	research_service_drainage_fee:24,
	research_environmental_fee:25,
	register_NewWatch_install:26,
	explain_NewWatch_install_same_location:27,
	explain_NewWatch_install_fee:28,
	change_information_contract:29,
	provide_customer_information:30,
	forget_personal_information:31,
	discuss_information:32,
	default_error:33
};

export const InformationStatus = {
	idle: 0,
	info_reflect_quality: 1,
	done_info_reflect_quality : 3,
	info_reflect_supply: 4,
	done_info_reflect_supply : 5,
	info_request_watch_repair:6,
	done_info_request_watch_repair:7,
	info_request_pipe_repair:8,
	done_info_request_pipe_repair:9,
	info_request_IndexWatch_check_explain:10,
	done_info_request_IndexWatch_check_explain:11,
	info_request_valve_repair:12,
	done_info_request_valve_repair:13,
	info_request_area_refund:14,
	done_info_request_area_refund:15,
	info_request_invoices:16,
	info_instruction_IndexWater_report:17,
	done_info_instruction_IndexWater_report_input:18,
	info_register_NewWatch_install:19,
	info_change_information_contract:20,
	info_request_IndexWater_date:21,
	info_request_watch_move_lift:22,
	done_info_request_watch_move_lift:23,
	done_info_change_information_contract:24,
	instruction_payment_methods:25,
	done_info_request_IndexWater_date:26,
	done_info_register_NewWatch_install:27,
	info_request_watch_box_secure:28,
	done_info_request_watch_box_secure:29,
};

export const PushContextStatus = {
	idle:0,
	inflect_color_water:1,
	request_watch_repair:2,
	request_watch_move_lift:3,
	register_NewWatch_install:4,
	request_pipe_repair:5,
	request_IndexWatch_check_explain:6,
	request_IndexWater_report_input:7,
	request_watch_box_secure:8,
	change_information_contract:9
};

export const ForgetInformationStatus = {
	info_forget_user_id:0,
	info_forget_user_name_address:1,
	info_forget_watch_id:2,
};

export const flag_rememberInformation = {
	reflect_water_quality:false,
	request_watch_repair:false,
	request_watch_move_lift:false,
	change_information_contract:false,
}

export function getActionStatus(_action){
	let _ActionStatus = ActionStatus.idle;
	if (_action == "Chào hỏi") _ActionStatus = ActionStatus.greeting;
	else if(_action == "Cảm ơn") _ActionStatus = ActionStatus.say_thanks;
	else if (_action == "Phản ánh về chất lượng nước") _ActionStatus = ActionStatus.reflect_water_quality;
	else if (_action == "Phản ánh về tình trạng cấp nước") _ActionStatus = ActionStatus.reflect_water_supply;
	else if (_action == "Yêu cầu sửa chữa đồng hồ") _ActionStatus = ActionStatus.request_watch_repair;
	else if (_action == "Yêu cầu di dời,nâng hạ đồng hồ") _ActionStatus = ActionStatus.request_watch_move_lift;
	else if (_action == "Yêu cầu lắp bảo vệ đồng hồ") _ActionStatus = ActionStatus.request_watch_box_secure;
	else if (_action == "Yêu cầu sửa chữa đường ống do hư hỏng,rò rỉ hoặc xì") _ActionStatus = ActionStatus.request_pipe_repair;
	else if (_action == "Yêu cầu kiểm tra giải thích chỉ số,đồng hồ") _ActionStatus = ActionStatus.request_IndexWatch_check_explain;
	else if (_action == "Yêu cầu sửa chữa van") _ActionStatus = ActionStatus.request_valve_repair;
	else if (_action == "Yêu cầu hoàn trả mặt bằng") _ActionStatus = ActionStatus.request_area_refund;
	else if (_action == "Hướng dẫn về các hình thức thanh toán") _ActionStatus = ActionStatus.instruction_payment_methods;
	else if (_action == "Yêu cầu liên quan đến hóa đơn" || _action == "Yêu cầu liên quan đến hoá đơn" ) _ActionStatus = ActionStatus.request_invoices;
	else if (_action == "Yêu cầu báo,nhập chỉ số nước") _ActionStatus = ActionStatus.request_IndexWater_report_input;
	else if (_action == "Hướng dẫn nhập dãy chỉ số nước") _ActionStatus = ActionStatus.instruction_IndexWaterString_input;
	else if (_action == "Giải thích kỳ hoá đơn chỉ số nước" || _action == "Giải thích kỳ hoá đơn hoá đơn chỉ số nước") _ActionStatus = ActionStatus.explain_bill_period;
	else if (_action == "Yêu cầu ngày ghi chỉ số nước") _ActionStatus = ActionStatus.request_IndexWater_date;
	else if (_action == "Giải thích tạm tính") _ActionStatus = ActionStatus.explain_temporary_calculate;
	else if (_action == "Tìm hiểu về giá nước") _ActionStatus = ActionStatus.research_water_price;
	else if (_action == "Giải thích về giá nước kinh doanh" || _action == "Tìm hiểu về giá nước kinh doanh") _ActionStatus = ActionStatus.explain_business_water_price;
	else if (_action == "Tìm hiểu về thuế nước") _ActionStatus = ActionStatus.research_tax_water;
	else if (_action == "Tìm hiểu về dịch vụ thoát nước") _ActionStatus = ActionStatus.research_service_drainage_fee;
	else if (_action == "Tìm hiểu về phí tài nguyên môi trường") _ActionStatus = ActionStatus.research_environmental_fee;
	else if (_action == "Đăng ký thủ tục lắp,gắn đồng hồ mới") _ActionStatus = ActionStatus.register_NewWatch_install;
	else if (_action == "Giải thích lắp,gắn thêm đồng hồ mới") _ActionStatus = ActionStatus.explain_NewWatch_install_same_location;
	else if (_action == "Giải thích về chi phí lắp,gắn thêm đồng hồ") _ActionStatus = ActionStatus.explain_NewWatch_install_fee;
	else if (_action == "Thay đổi thông tin trên hợp đồng cấp nước") _ActionStatus = ActionStatus.change_information_contract;
	else if (_action == "Cung cấp thông tin khách hàng") _ActionStatus = ActionStatus.provide_customer_information;
	else if (_action == "Quên thông tin cá nhân") _ActionStatus = ActionStatus.forget_personal_information;
	else if(_action == "Trao đổi thông tin") _ActionStatus = ActionStatus.discuss_information;
	else  _ActionStatus = ActionStatus.default_error;
	return _ActionStatus;
}

