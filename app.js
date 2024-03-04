import {ActionStatus, ForgetInformationStatus,InformationStatus, PushContextStatus, getActionStatus,
		flag_rememberInformation } from './Controller/fsmStatus.js' ;
import {objectContext, clearObjContext, messageFirst_UserID, messageSecond_Phone} from './Controller/objectContext.js';
import {isValidCustomerID, isValidCustomerName, isValidPhoneNumber, 
        isValidAddress, isValidIndexWater, isValidWatchID} from './Controller/validateFormat.js';
import { getCheckCustomer, myList, checkDB_CustomerID} from './Controller/checkDatabase.js';


function clearContent(){	
    document.getElementById('chatbox').innerHTML = '';
}

const url = new URL(window.location.href);
const key = url.searchParams.get('key');
const chatbox = $("#chatbox");
const userInput = $("#userInput");
const sendButton = $("#sendButton");
const _date = new Date();

sendButton.on("click", () => {
    const message = userInput.val();
    if (message) {
        messages = message;
		const displaytext = window.markdownit().render(message);
		let userMessageHtml = '<pre><div class="message right-side "  >' + displaytext + '</div></pre>';
		chatbox.append(userMessageHtml);
		chatbox.animate({ scrollTop: 20000000 }, "slow");
        userInput.val("");
        sendButton.val("Generating Response...");
		sendButton.prop("disabled", true);
        fetchMessages();
    }
});

userInput.on("keydown", (event) => {
    if (event.keyCode === 13 && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        sendButton.click();
    } else if (event.keyCode === 13 && (event.ctrlKey || event.shiftKey)) {
        event.preventDefault();
        const cursorPosition = userInput.prop("selectionStart");
        const currentValue = userInput.val();

        userInput.val(
            currentValue.slice(0, cursorPosition) +
            "\n" +
            currentValue.slice(cursorPosition)
        );
        userInput.prop("selectionStart", cursorPosition + 1);

        userInput.prop("selectionEnd", cursorPosition + 1);
    }
});

//================================= config ===================================
var apiKey = "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";
var modelID = "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL";
//===========================================================================

//================================= variables================================
let messages = "";
let _action = "";
let _category = "";
let _phone_number = "";
let _user_id = "";
let _user_name = "";
let _address = "";
let _month = "";
let _year = "";
let _device_id = "";
let _index_value = "";
let _response ="";
var _end_conversation = "";
var _arrange_response = "";
//===========================================================================

//============================cache variables ===============================
var _cache_Data = {
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
	question_user_id: "",
	question_phone_number: "",
	user_id_sentence:"",
	phone_number_sentence:"",
	// end_conversation: "",
	// arrange_response: "",
}
//===========================================================================

//===========================define states of FSM=============================
var _InfoStatus = InformationStatus.idle;
var _ForgetStatus = ForgetInformationStatus.info_forget_user_id;
var _PrevActionStatus = ActionStatus.idle;
var _PushContextStatus = PushContextStatus.idle;
var result_output;
var end_conversation = "false";
var arrange_response =1;
var flag_result = false;
//===========================================================================

//===========================help functions =================================
function validateAndExtractInfo(inputString, _InfoStatus) {
	// split string
	const parts = inputString.split(',');
	// handle with having space
	const processedParts = parts.map(part => part.trim());

	let temp_customerID = "";
	let temp_customerName = "";
	let temp_phoneNumber = "";
	let temp_address = "";
	let temp_index_water = "";
	let temp_device_id = "";
    // Duyệt qua từng phần và xác định loại thông tin
	for (const part of processedParts) {
		if(isValidCustomerID(part)){
			temp_customerID = part;
			//console.log(temp_customerID);
		}
		else if (isValidPhoneNumber(part)) {
			temp_phoneNumber = part;
			//console.log(temp_phoneNumber);
		} 
		else if (isValidCustomerName(part)) {
			temp_customerName = part;
			//console.log(temp_customerName);
		} 
		else if(isValidIndexWater(part)){
			temp_index_water = part;
			//console.log(temp_index_water);
		}
		else if(isValidWatchID(part)) {
			temp_device_id = part;
			//console.log(temp_device_id);
		}
		else if (isValidAddress(part)) {
			temp_address = part;
			//console.log(temp_address);
		}
		
  	}
  	// check value
  	const isValidInfo = {
		customerID: temp_customerID,
		phoneNumber: temp_phoneNumber,
		customerName: temp_customerName,
		index_water: temp_index_water,
		device_id: temp_device_id,
		address: temp_address
  	};
	if(_InfoStatus == InformationStatus.info_register_NewWatch_install){
		if (isValidInfo.customerName  && isValidInfo.phoneNumber  && isValidInfo.address) {
    		return isValidInfo;
    	}
		else {
			return false;
		}
	}
	else if(_InfoStatus == InformationStatus.info_change_information_contract){
		if ( isValidInfo.customerID || isValidInfo.address || (isValidInfo.customerID && isValidInfo.address)) {
			
    		return isValidInfo;
    	}
		else {
			return false;
		}
	}
	
}

function messageUser(input_user){
    return {
        "role": "user",
        "content": input_user
    };
}

function messageAssistant(input_assistant, _action="", _category="", _user_id="", _device_id="", 
						_phone_number="", _user_name="", _address="", _index_value="", _month="", 
						_year="",_end_conversation=end_conversation, _arrange_response=arrange_response){
	return {
        "role": "assistant",
		"content": '{"hành_động":"' + _action + '","phân_loại":"' + _category + '","mã_khách_hàng":"' + _user_id + 
				   '","số_điện_thoại":"' + _phone_number + '","tên_khách_hàng":"' + _user_name + '","địa_chỉ":"' + 
				    _address + '","mã_đồng_hồ":"' + _device_id+ '","chỉ_số_nước":"' + _index_value + '","tháng":"' + 
					_month + '","năm":"' + _year + '","trả_lời":"' + input_assistant + '","kết_thúc":"' + _end_conversation + 
					'","số_thứ_tự_trả_lời":"' + _arrange_response + '"}'
	};
}


function clearPreviousAction(){
	_PrevActionStatus = ActionStatus.idle;
}

function clearForgetStatus(){
	_ForgetStatus = ActionStatus.idle;
}

function clearPushContextStatus(){
	_PushContextStatus = PushContextStatus.idle;
	end_conversation = "false";
	arrange_response ="1";
	flag_result = false;
	_end_conversation = "";
	_arrange_response = "";
}

function clearAllContext(){
	clearObjContext();
	clearPreviousAction();
	clearPushContextStatus();
	flag_rememberInformation.reflect_water_quality = false;
	flag_rememberInformation.request_watch_repair = false;
	flag_rememberInformation.request_watch_move_lift = false;
	flag_rememberInformation.change_information_contract = false;
}


function handle_RemainInformation(ObjContext,_action, _category, _user_id, _device_id, _phone_number, 
								_user_name, _address, _index_value,_month, _year,_end_conversation, _arrange_response){
	let _result_handle_RemainInformation = "";
	console.log(_InfoStatus);
	if(_InfoStatus == InformationStatus.info_reflect_quality){
		if(checkDB_CustomerID(_cache_Data["user_id"], myList)){
			clearForgetStatus();
			objectContext["message_history"].push(messageUser(_cache_Data["user_id_sentence"]));
			_InfoStatus = InformationStatus.done_info_reflect_quality;
			_result_handle_RemainInformation +=getCheckCustomer(_cache_Data["user_id"], _result_handle_RemainInformation);
			let result_push = "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
			_result_handle_RemainInformation += result_push;
			if(_PushContextStatus == PushContextStatus.inflect_color_water){
				if(flag_rememberInformation.reflect_water_quality == true){
					objectContext["message_history"].push(messageSecond_Phone(_cache_Data["user_id"]));
					arrange_response++;
					if(_cache_Data["phone_number_sentence"] == ""){
						objectContext["message_history"].push(messageUser("số điện thoại: 0123456789"));
					}
					else{
						objectContext["message_history"].push(messageUser(_cache_Data["phone_number_sentence"]));
					}
					flag_rememberInformation.reflect_water_quality = false;
				}
				else{
					objectContext["message_history"].push(messageAssistant(result_push, _action, _category, _user_id, _device_id, 
																			_phone_number, _user_name, _address, _index_value,_month, 
																			_year,end_conversation,arrange_response));
					arrange_response++;
				}
			}
			
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}

	}
	else if(_InfoStatus == InformationStatus.info_reflect_supply){
		if(checkDB_CustomerID(_cache_Data["user_id"], myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_reflect_supply;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
			
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}

	}
	else if(_InfoStatus == InformationStatus.info_request_watch_repair){
		if(checkDB_CustomerID(_cache_Data["user_id"], myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_watch_repair;
			_result_handle_RemainInformation +=getCheckCustomer(_cache_Data["user_id"], _result_handle_RemainInformation);
			let result_push = "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
			_result_handle_RemainInformation += result_push;
			if(flag_rememberInformation.request_watch_repair == true){
				objectContext["message_history"].push(messageSecond_Phone(_cache_Data["user_id"]));
				arrange_response++;
				if(_cache_Data["phone_number_sentence"] == ""){
					objectContext["message_history"].push(messageUser("số điện thoại: 0123456789"));
				}
				else{
					objectContext["message_history"].push(messageUser(_cache_Data["phone_number_sentence"]));
				}
				flag_rememberInformation.request_watch_repair = false;
			}
			else{
				objectContext["message_history"].push(messageAssistant(result_push, _action, _category, _user_id, _device_id, 
																		_phone_number, _user_name, _address, _index_value,_month, 
																		_year,end_conversation,arrange_response));
				arrange_response++;
			}
			
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
	}
	else if(_InfoStatus == InformationStatus.info_request_watch_move_lift){
		if(checkDB_CustomerID(_cache_Data["user_id"], myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_watch_move_lift;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
			let result_push = "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
			_result_handle_RemainInformation += result_push;
			if(flag_rememberInformation.request_watch_move_lift == true){
				objectContext["message_history"].push(messageSecond_Phone(_cache_Data["user_id"]));
				arrange_response++;
				if(_cache_Data["phone_number_sentence"] == ""){
					objectContext["message_history"].push(messageUser("số điện thoại: 0123456789"));
				}
				else{
					objectContext["message_history"].push(messageUser(_cache_Data["phone_number_sentence"]));
				}
				flag_rememberInformation.request_watch_move_lift = false;
			}
			else{
				objectContext["message_history"].push(messageAssistant(result_push, _action, _category, _user_id, _device_id, 
																		_phone_number, _user_name, _address, _index_value,_month, 
																		_year,end_conversation,arrange_response));
				arrange_response++;
			}
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
		//}
		// else if(ask_more == 1){
		// 	_result_handle_RemainInformation += "Anh/chị muốn dời đồng hồ từ trong ra ngoài, hay từ ngoài vào trong ạ?";
		// }
	}
	else if(_InfoStatus == InformationStatus.info_request_watch_box_secure){
		if(checkDB_CustomerID(_cache_Data["user_id"], myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_watch_box_secure;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}

	}
	else if(_InfoStatus == InformationStatus.info_request_IndexWatch_check_explain){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_IndexWatch_check_explain;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
		
	}
	else if(_InfoStatus == InformationStatus.info_request_pipe_repair){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_pipe_repair;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
	}
	else if(_InfoStatus == InformationStatus.info_request_valve_repair){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_valve_repair;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
	}
	else if(_InfoStatus == InformationStatus.info_request_area_refund){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_area_refund;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
	}
	else if (_InfoStatus == InformationStatus.info_request_invoices){
		if(_PrevActionStatus == ActionStatus.request_invoices){
			var chat_ai = {
				url: "https://api.openai.com/v1/chat/completions" ,
				method: "POST",
				timeout: 5000,
				async: false,
				"headers": {
					"Content-Type": "application/json",
    				"Authorization": "Bearer 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",
				},
				"data": JSON.stringify({
					"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
					"messages": objectContext["message_history"],
					"temperature": 0,
					"max_tokens": 200,
				}),
			}
			$.ajax(chat_ai).done(function(response) {
				let resp = response.choices[0].message.content.trim();
				resp = resp.replace("tháng", "month");
				let json_data = JSON.parse(resp);
				if (json_data["month"] != ""){ 
					_month = json_data["month"];
				}
			});	
			clearObjContext();
			clearPreviousAction();
			clearPushContextStatus();
			var water_info = {
				url: "http://lpnserver.net:51087/bwaco?id=" + _user_id + "&m=" + _month + "&y=" + _cache_Data["year"],
				method: "GET",
				timeout: 5000,
				async: false
			}
			$.ajax(water_info).done(function(res) {
				let len = res.length;
				_result_handle_RemainInformation += "Hoá đơn tiền nước của nhà mình như sau:\n\n";
				res.forEach(element => {
					_result_handle_RemainInformation += "(ID-" + element["idkh"] + ") Tên Khách Hàng: " + element["tenKhachHang"] + ", Mã KH: " + element["maKhachHang"] + "\n\n";
					_result_handle_RemainInformation += "* Hoá đơn nước tháng " + String(element["thang"]) + " năm " + String(element["nam"]) + "\n\n";
					_result_handle_RemainInformation += "* Chỉ số đầu: " + String(element["chiSoDau"]) + ", chỉ số cuối: " + String(element["chiSoCuoi"]) + ", tổng khối lượng: " + String(element["khoiluong"]) + "\n\n";
					_result_handle_RemainInformation += "* Tổng tiền: " + element["tongTien"] + "đ\n\n";
					if (element["hetNo"] == true) {
						_result_handle_RemainInformation += "* Tình trạng hoá đơn: ĐÃ THANH TOÁN";
					} else {
						_result_handle_RemainInformation += "* Tình trạng hoá đơn: CHƯA THANH TOÁN";
					}
				});
			});
		}
		else{
			if(checkDB_CustomerID(_user_id, myList)){
				_InfoStatus = InformationStatus.idle;
				if (_cache_Data["month"] == ""){
					if(_date.getDay() <= 25){
						_month = String(_date.getMonth());
					}
					else{
						_month = String(_date.getMonth() + 1);
					}
				}
				if (_cache_Data["year"] == ""){
					_year = String(_date.getFullYear());
				}
				if (_cache_Data["month"] == "-1") {
					let cur_month = _date.getMonth() + 1;
					let cur_year = _date.getFullYear();
					if (cur_month == 1) {
						cur_month = 12;
						cur_year = cur_year - 1;
					} else {
						cur_month = cur_month - 1;
					}
					_month = String(cur_month);
					_year = String(cur_year);
				}
				if ((parseInt(_month) > (_date.getMonth() + 1)) && ((_year == "") || (parseInt(_year) >= _date.getFullYear()))) {
					_year = String(_date.getFullYear() - 1);
				}
				var water_info = {
					url: "http://lpnserver.net:51087/bwaco?id=" + _user_id + "&m=" + _month + "&y=" + _year,
					method: "GET",
					timeout: 5000,
					async: false
				}
				$.ajax(water_info).done(function(resp) {
					let len = resp.length;
					_result_handle_RemainInformation = "Hoá đơn tiền nước của nhà mình như sau:\n\n";
					resp.forEach(element => {
						_result_handle_RemainInformation += "(ID-" + element["idkh"] + ") Tên Khách Hàng: " + element["tenKhachHang"] + ", Mã KH: " + element["maKhachHang"] + "\n\n";
						_result_handle_RemainInformation += "* Hoá đơn nước tháng " + String(element["thang"]) + " năm " + String(element["nam"]) + "\n\n";
						_result_handle_RemainInformation += "* Chỉ số đầu: " + String(element["chiSoDau"]) + ", chỉ số cuối: " + String(element["chiSoCuoi"]) + ", tổng khối lượng: " + String(element["khoiluong"]) + "\n\n";
						_result_handle_RemainInformation += "* Tổng tiền: " + element["tongTien"] + "đ\n\n";
						if (element["hetNo"] == true) {
							_result_handle_RemainInformation += "* Tình trạng hoá đơn: ĐÃ THANH TOÁN";
						} else {
							_result_handle_RemainInformation += "* Tình trạng hoá đơn: CHƯA THANH TOÁN";
						}
					});
				});
			}
			else {
				_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
				objectContext["user_id"] = "";
			}
		}
		
	}
	else if(_InfoStatus == InformationStatus.info_instruction_IndexWater_report){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_instruction_IndexWater_report_input;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}

	}
	else if(_InfoStatus == InformationStatus.info_request_IndexWater_date){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_request_IndexWater_date;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
		}
	}
	else if(_InfoStatus == InformationStatus.info_register_NewWatch_install){
		_InfoStatus = InformationStatus.done_info_register_NewWatch_install;
		//objectContext["message_history"].push(messageUser(messages));
		_result_handle_RemainInformation += "Vâng, Tên Khách Hàng: " + _user_name + ", Số điện thoại: " + _phone_number + ", Địa chỉ: " + _address +".\n";
		var chat_ai = {
			url: "https://api.openai.com/v1/chat/completions" ,
			method: "POST",
			timeout: 5000,
			async: false,
			"headers": {
				"Content-Type": "application/json",
				"Authorization": "Bearer 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",
			},
			"data": JSON.stringify({
				"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
				"messages": objectContext["message_history"],
				"temperature": 0,
				"max_tokens": 400,
				"top_p": 1,
				"frequency_penalty": 0,
				"presence_penalty": 0
			}),
		}
		$.ajax(chat_ai).done(function(response) {
			let resp = response.choices[0].message.content.trim();
			console.log(resp);
			resp = resp.replace("hành_động", "action");
			resp = resp.replace("phân_loại", "category");
			resp = resp.replace("số_điện_thoại", "phone_number");
			resp = resp.replace("mã_khách_hàng", "user_id");
			resp = resp.replace("tên_khách_hàng", "user_name");
			resp = resp.replace("địa_chỉ", "address");
			resp = resp.replace("tháng", "month");
			resp = resp.replace("năm", "year");
			resp = resp.replace("mã_đồng_hồ", "number_id");
			resp = resp.replace("chỉ_số_nước", "number_value");
			resp = resp.replace("trả_lời", "response");
			resp = resp.replace("kết_thúc", "end_conversation");
			resp = resp.replace("số_thứ_tự_trả_lời", "arrange_response");
			let json_data = JSON.parse(resp);
			if (json_data["action"] != "") {
				_action = json_data["action"];
				_cache_Data["action"] = json_data["action"];
				objectContext["action"] = json_data["action"];
			}
			if (json_data["category"] != "") {
				_category = json_data["category"];
				_cache_Data["category"] = json_data["category"];
				objectContext["category"] = json_data["category"];
			}
			if (json_data["phone_number"] != "") {
				_phone_number = json_data["phone_number"];
				_cache_Data["phone_number"] = json_data["phone_number"];
				objectContext["phone_number"] = json_data["phone_number"];
			}
			if (json_data["user_id"] != ""){
				_user_id = json_data["user_id"];
				_cache_Data["user_id"] = json_data["user_id"];
				objectContext["user_id"] = json_data["user_id"];
			}
			if (json_data["user_name"] != "") {
				_user_name = json_data["user_name"];
				_cache_Data["user_name"] = json_data["user_name"];
				objectContext["user_name"] =json_data["user_name"];
			}
			if (json_data["address"] != "") {
				_address = json_data["address"];
				_cache_Data["address"] = json_data["address"];
				objectContext["address"] = json_data["address"];
			}
			if (json_data["device_id"] != "") {
				_device_id = json_data["device_id"];
				_cache_Data["device_id"] = json_data["device_id"];
				objectContext["device_id"] = json_data["device_id"];
			}
			if (json_data["index_value"] != "") {
				_index_value = json_data["index_value"];
				_cache_Data["index_value"] = json_data["index_value"];
				objectContext["index_value"] = json_data["index_value"];
			}
			if (json_data["month"] != "") {
				_month = json_data["month"];
				_cache_Data["month"] = json_data["month"];
				objectContext["month"]=json_data["month"];
			}
			if (json_data["year"] != ""){ 
				_year = json_data["year"];
				_cache_Data["year"] = json_data["year"];
				objectContext["year"] = json_data["year"];
			}
			if (json_data["response"] != ""){ 
				_response = json_data["response"];
				_result_handle_RemainInformation += _response;
			}
			if (json_data["end_conversation"] != ""){ 
				_end_conversation = json_data["end_conversation"];
				end_conversation = _end_conversation;
				//_cache_Data["end_conversation"] = json_data["end_conversation"];
			}
			if (json_data["arrange_response"] != ""){ 
				_arrange_response = json_data["arrange_response"];
				arrange_response = arrange_response;
				//_cache_Data["arrange_response"] =  json_data["arrange_response"];
			}	
			objectContext["message_history"].push(messageAssistant(_result_handle_RemainInformation,_action, _category, _user_id, _device_id, _phone_number, _user_name, _address, _index_value,_month, _year, end_conversation, arrange_response));
			arrange_response++;
		});	
	}
	else if(_InfoStatus == InformationStatus.info_change_information_contract){
		if(checkDB_CustomerID(_user_id, myList)){
			clearForgetStatus();
			_InfoStatus = InformationStatus.done_info_change_information_contract;
			_PushContextStatus = PushContextStatus.change_information_contract;
			_PrevActionStatus = ActionStatus.provide_customer_information;
			_result_handle_RemainInformation +=getCheckCustomer(String(_cache_Data["user_id"]), _result_handle_RemainInformation);
			_result_handle_RemainInformation += "Anh/chị vui lòng cung cấp số điện thoại liên hệ";
		}
		else{
			_result_handle_RemainInformation += "Mã khách hàng không hợp lệ, anh/chị vui lòng kiểm tra lại";
			clearObjContext();
		}
		
	}

	return _result_handle_RemainInformation;
}

function handle_DoneInformation(ObjContext, _action, _category, _user_id, _device_id, _phone_number, 
								_user_name, _address, _index_value,_month, _year,_end_conversation, _arrange_response){
	let _result_handle_DoneInformation ="";
	if (_InfoStatus == InformationStatus.done_info_reflect_quality){
		if(_PushContextStatus == PushContextStatus.inflect_color_water){
			var chat_ai = {
				url: "https://api.openai.com/v1/chat/completions" ,
				method: "POST",
				timeout: 5000,
				async: false,
				"headers": {
					"Content-Type": "application/json",
    				"Authorization": "Bearer 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",
				},
				"data": JSON.stringify({
					"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
					"messages": objectContext["message_history"],
					"temperature": 0,
					"max_tokens": 400,
					"top_p": 1,
					"frequency_penalty": 0,
					"presence_penalty": 0
				}),
			}
			$.ajax(chat_ai).done(function(response) {
				let resp = response.choices[0].message.content.trim();
				console.log(resp);
				resp = resp.replace("hành_động", "action");
				resp = resp.replace("phân_loại", "category");
				resp = resp.replace("số_điện_thoại", "phone_number");
				resp = resp.replace("mã_khách_hàng", "user_id");
				resp = resp.replace("tên_khách_hàng", "user_name");
				resp = resp.replace("địa_chỉ", "address");
				resp = resp.replace("tháng", "month");
				resp = resp.replace("năm", "year");
				resp = resp.replace("mã_đồng_hồ", "number_id");
				resp = resp.replace("chỉ_số_nước", "number_value");
				resp = resp.replace("trả_lời", "response");
				resp = resp.replace("kết_thúc", "end_conversation");
				resp = resp.replace("số_thứ_tự_trả_lời", "arrange_response");
				let json_data = JSON.parse(resp);
				if (json_data["action"] != "") {
					_action = json_data["action"];
					_cache_Data["action"] = json_data["action"];
					objectContext["action"] = json_data["action"];
				}
				if (json_data["category"] != "") {
					_category = json_data["category"];
					_cache_Data["category"] = json_data["category"];
					objectContext["category"] = json_data["category"];
				}
				if (json_data["phone_number"] != "") {
					_phone_number = json_data["phone_number"];
					_cache_Data["phone_number"] = json_data["phone_number"];
					objectContext["phone_number"] = json_data["phone_number"];
				}
				if (json_data["user_id"] != ""){
					_user_id = json_data["user_id"];
					_cache_Data["user_id"] = json_data["user_id"];
					objectContext["user_id"] = json_data["user_id"];
				}
				if (json_data["user_name"] != "") {
					_user_name = json_data["user_name"];
					_cache_Data["user_name"] = json_data["user_name"];
					objectContext["user_name"] =json_data["user_name"];
				}
				if (json_data["address"] != "") {
					_address = json_data["address"];
					_cache_Data["address"] = json_data["address"];
					objectContext["address"] = json_data["address"];
				}
				if (json_data["device_id"] != "") {
					_device_id = json_data["device_id"];
					_cache_Data["device_id"] = json_data["device_id"];
					objectContext["device_id"] = json_data["device_id"];
				}
				if (json_data["index_value"] != "") {
					_index_value = json_data["index_value"];
					_cache_Data["index_value"] = json_data["index_value"];
					objectContext["index_value"] = json_data["index_value"];
				}
				if (json_data["month"] != "") {
					_month = json_data["month"];
					_cache_Data["month"] = json_data["month"];
					objectContext["month"]=json_data["month"];
				}
				if (json_data["year"] != ""){ 
					_year = json_data["year"];
					_cache_Data["year"] = json_data["year"];
					objectContext["year"] = json_data["year"];
				}
				if (json_data["response"] != ""){ 
					_response = json_data["response"];
					_result_handle_DoneInformation = _response;
				}
				if (json_data["end_conversation"] != ""){ 
					_end_conversation = json_data["end_conversation"];
					end_conversation = _end_conversation;
				}
				if (json_data["arrange_response"] != ""){ 
					_arrange_response = json_data["arrange_response"];
					arrange_response = arrange_response;
				}	
				objectContext["message_history"].push(messageAssistant(_result_handle_DoneInformation,_action, _category, _user_id, _device_id, _phone_number, _user_name, _address, _index_value,_month, _year, end_conversation, arrange_response));
				arrange_response++;
			});		
		}	
		else{
			_result_handle_DoneInformation = "Bwaco xin ghi nhận thông tin: Phản ánh chất lượng nước. Thông tin của anh/chị đã được ghi nhận. Sẽ có nhân viên của BWACO liên hệ với anh/chị trong thời gian sớm nhất có thể. Xin cảm ơn!";
			_InfoStatus = InformationStatus.idle;
			clearAllContext();
		}
	}
	else if (_InfoStatus == InformationStatus.done_info_reflect_supply){
			_result_handle_DoneInformation = "Bwaco xin ghi nhận thông tin: Phản ánh tình trạng cấp nước. Thông tin của anh/chị đã được ghi nhận. Sẽ có nhân viên của BWACO liên hệ với anh/chị trong thời gian sớm nhất có thể. Xin cảm ơn!";
			_InfoStatus = InformationStatus.idle;
			clearAllContext();
	}
	else if(_InfoStatus == InformationStatus.done_info_request_watch_repair){
		if(_PushContextStatus == PushContextStatus.request_watch_repair){	
			var chat_ai = {
				url: "https://api.openai.com/v1/chat/completions" ,
				method: "POST",
				timeout: 5000,
				async: false,
				"headers": {
					"Content-Type": "application/json",
    				"Authorization": "Bearer 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",
				},
				"data": JSON.stringify({
					"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
					"messages": objectContext["message_history"],
					"temperature": 0,
					"max_tokens": 400,
					"top_p": 1,
					"frequency_penalty": 0,
					"presence_penalty": 0
				}),
			}
			$.ajax(chat_ai).done(function(response) {
				let resp = response.choices[0].message.content.trim();
				resp = resp.replace("hành_động", "action");
				resp = resp.replace("phân_loại", "category");
				resp = resp.replace("số_điện_thoại", "phone_number");
				resp = resp.replace("mã_khách_hàng", "user_id");
				resp = resp.replace("tên_khách_hàng", "user_name");
				resp = resp.replace("địa_chỉ", "address");
				resp = resp.replace("tháng", "month");
				resp = resp.replace("năm", "year");
				resp = resp.replace("mã_đồng_hồ", "number_id");
				resp = resp.replace("chỉ_số_nước", "number_value");
				resp = resp.replace("trả_lời", "response");
				resp = resp.replace("kết_thúc", "end_conversation");
				resp = resp.replace("số_thứ_tự_trả_lời", "arrange_response");
				let json_data = JSON.parse(resp);
				if (json_data["action"] != "") {
					_action = json_data["action"];
					_cache_Data["action"] = json_data["action"];
					objectContext["action"] = json_data["action"];
				}
				if (json_data["category"] != "") {
					_category = json_data["category"];
					_cache_Data["category"] = json_data["category"];
					objectContext["category"] = json_data["category"];
				}
				if (json_data["phone_number"] != "") {
					_phone_number = json_data["phone_number"];
					_cache_Data["phone_number"] = json_data["phone_number"];
					objectContext["phone_number"] = json_data["phone_number"];
				}
				if (json_data["user_id"] != ""){
					_user_id = json_data["user_id"];
					_cache_Data["user_id"] = json_data["user_id"];
					objectContext["user_id"] = json_data["user_id"];
				}
				if (json_data["user_name"] != "") {
					_user_name = json_data["user_name"];
					_cache_Data["user_name"] = json_data["user_name"];
					objectContext["user_name"] =json_data["user_name"];
				}
				if (json_data["address"] != "") {
					_address = json_data["address"];
					_cache_Data["address"] = json_data["address"];
					objectContext["address"] = json_data["address"];
				}
				if (json_data["device_id"] != "") {
					_device_id = json_data["device_id"];
					_cache_Data["device_id"] = json_data["device_id"];
					objectContext["device_id"] = json_data["device_id"];
				}
				if (json_data["index_value"] != "") {
					_index_value = json_data["index_value"];
					_cache_Data["index_value"] = json_data["index_value"];
					objectContext["index_value"] = json_data["index_value"];
				}
				if (json_data["month"] != "") {
					_month = json_data["month"];
					_cache_Data["month"] = json_data["month"];
					objectContext["month"]=json_data["month"];
				}
				if (json_data["year"] != ""){ 
					_year = json_data["year"];
					_cache_Data["year"] = json_data["year"];
					objectContext["year"] = json_data["year"];
				}
				if (json_data["response"] != ""){ 
					_response = json_data["response"];
					_result_handle_DoneInformation = _response;
				}
				if (json_data["end_conversation"] != ""){ 
					_end_conversation = json_data["end_conversation"];
					end_conversation = _end_conversation;
				}
				if (json_data["arrange_response"] != ""){ 
					_arrange_response = json_data["arrange_response"];
					arrange_response = arrange_response;
				}	
				objectContext["message_history"].push(messageAssistant(_result_handle_DoneInformation,_action, _category, _user_id, _device_id, _phone_number, _user_name, _address, _index_value,_month, _year, end_conversation, arrange_response));
				arrange_response++;
			});
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_request_watch_move_lift){
		if(_PushContextStatus == PushContextStatus.request_watch_move_lift){	
			var chat_ai = {
				url: "https://api.openai.com/v1/chat/completions" ,
				method: "POST",
				timeout: 5000,
				async: false,
				"headers": {
					"Content-Type": "application/json",
    				"Authorization": "Bearer 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",
				},
				"data": JSON.stringify({
					"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
					"messages": objectContext["message_history"],
					"temperature": 0,
					"max_tokens": 400,
					"top_p": 1,
					"frequency_penalty": 0,
					"presence_penalty": 0
				}),
			}
			$.ajax(chat_ai).done(function(response) {
				let resp = response.choices[0].message.content.trim();
				resp = resp.replace("hành_động", "action");
				resp = resp.replace("phân_loại", "category");
				resp = resp.replace("số_điện_thoại", "phone_number");
				resp = resp.replace("mã_khách_hàng", "user_id");
				resp = resp.replace("tên_khách_hàng", "user_name");
				resp = resp.replace("địa_chỉ", "address");
				resp = resp.replace("tháng", "month");
				resp = resp.replace("năm", "year");
				resp = resp.replace("mã_đồng_hồ", "number_id");
				resp = resp.replace("chỉ_số_nước", "number_value");
				resp = resp.replace("trả_lời", "response");
				resp = resp.replace("kết_thúc", "end_conversation");
				resp = resp.replace("số_thứ_tự_trả_lời", "arrange_response");
				let json_data = JSON.parse(resp);
				if (json_data["action"] != "") {
					_action = json_data["action"];
					_cache_Data["action"] = json_data["action"];
					objectContext["action"] = json_data["action"];
				}
				if (json_data["category"] != "") {
					_category = json_data["category"];
					_cache_Data["category"] = json_data["category"];
					objectContext["category"] = json_data["category"];
				}
				if (json_data["phone_number"] != "") {
					_phone_number = json_data["phone_number"];
					_cache_Data["phone_number"] = json_data["phone_number"];
					objectContext["phone_number"] = json_data["phone_number"];
				}
				if (json_data["user_id"] != ""){
					_user_id = json_data["user_id"];
					_cache_Data["user_id"] = json_data["user_id"];
					objectContext["user_id"] = json_data["user_id"];
				}
				if (json_data["user_name"] != "") {
					_user_name = json_data["user_name"];
					_cache_Data["user_name"] = json_data["user_name"];
					objectContext["user_name"] =json_data["user_name"];
				}
				if (json_data["address"] != "") {
					_address = json_data["address"];
					_cache_Data["address"] = json_data["address"];
					objectContext["address"] = json_data["address"];
				}
				if (json_data["device_id"] != "") {
					_device_id = json_data["device_id"];
					_cache_Data["device_id"] = json_data["device_id"];
					objectContext["device_id"] = json_data["device_id"];
				}
				if (json_data["index_value"] != "") {
					_index_value = json_data["index_value"];
					_cache_Data["index_value"] = json_data["index_value"];
					objectContext["index_value"] = json_data["index_value"];
				}
				if (json_data["month"] != "") {
					_month = json_data["month"];
					_cache_Data["month"] = json_data["month"];
					objectContext["month"]=json_data["month"];
				}
				if (json_data["year"] != ""){ 
					_year = json_data["year"];
					_cache_Data["year"] = json_data["year"];
					objectContext["year"] = json_data["year"];
				}
				if (json_data["response"] != ""){ 
					_response = json_data["response"];
					_result_handle_DoneInformation = _response;
				}
				if (json_data["end_conversation"] != ""){ 
					_end_conversation = json_data["end_conversation"];
					end_conversation = _end_conversation;
				}
				if (json_data["arrange_response"] != ""){ 
					_arrange_response = json_data["arrange_response"];
					arrange_response = arrange_response;
				}	
				objectContext["message_history"].push(messageAssistant(_result_handle_DoneInformation,_action, _category, _user_id, _device_id, _phone_number, _user_name, _address, _index_value,_month, _year, end_conversation, arrange_response));
				arrange_response++;
			});
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_request_watch_box_secure){
		if(_PushContextStatus == PushContextStatus.request_watch_box_secure){
			_result_handle_DoneInformation = "Thông tin của anh/chị đã được ghi nhận. Sẽ có nhân viên của BWACO liên hệ với anh/chị trong thời gian sớm nhất có thể. Xin cảm ơn!";
			_PushContextStatus = PushContextStatus.idle;
		}
		else{
			_result_handle_DoneInformation = "Dạ cải tạo hộp bảo vệ đồng hồ Công ty sẽ không tính phí ạ.";
			_InfoStatus = InformationStatus.idle;
			clearPreviousAction();
		}
		
	}
	else if(_InfoStatus == InformationStatus.done_info_request_pipe_repair){
		if(_PushContextStatus == PushContextStatus.request_pipe_repair){
			_result_handle_DoneInformation = "Dạ Anh/chị vui lòng cung cấp địa chỉ điểm bể ạ.";
			_PushContextStatus = PushContextStatus.idle;
		}
		else{
			_result_handle_DoneInformation = "Cảm ơn thông tin anh/chị đã cung cấp. Nhân viên của BWACO sẽ khắc phục trong thời gian sớm nhất. Xin cảm ơn!";
			_InfoStatus = InformationStatus.idle;
			clearAllContext();
		}
		
	}
	else if(_InfoStatus == InformationStatus.done_info_request_IndexWatch_check_explain){
		if(_PushContextStatus == PushContextStatus.request_IndexWatch_check_explain){
			_result_handle_DoneInformation = "Anh/chị vui lòng kiểm tra sơ bộ hệ thống nước phía sau đồng hồ của nhà mình như sau: khóa van trước đồng hồ lại xem ĐH còn quay không ạ. Trường hợp khóa van trước ĐH lại ĐH không quay, mở ra mặc dù không dùng nước, ĐH vẫn quay thì có khả năng rò rỉ hệ thống nước phía sau ĐH. Đối với hệ thống phía sau ĐH thì Công ty không đủ nhân lực để hỗ trợ, Anh/chị vui lòng liên hệ thợ nước bên ngoài để khắc phục giúp ạ.";
			_PushContextStatus = PushContextStatus.idle;	
		}
		else{
			_result_handle_DoneInformation = "Thông tin của anh/chị đã được ghi nhận. Sẽ có nhân viên của BWACO liên hệ với anh/chị trong thời gian sớm nhất có thể. Trong thời gian đợi nhân viên hỗ trợ anh/chị vui lòng khóa van trước đồng hồ khi không sử dụng nước. Xin cảm ơn!";
			_InfoStatus = InformationStatus.idle;
			clearAllContext();
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_request_valve_repair){
		_result_handle_DoneInformation = "Bwaco xin ghi nhận thông tin: Sửa chữa van ống nước. Bạn vui lòng đợi bộ phận phụ trách liên hệ lại trong thời gian sớm nhất có thể. Xin cảm ơn!";
		_InfoStatus = InformationStatus.idle;
		clearAllContext();
	}  
	else if(_InfoStatus == InformationStatus.done_info_request_area_refund){
		_result_handle_DoneInformation = "Dạ phần hoàn trả mặt bằng do bộ phận Trám vá riêng phụ trách, do lượng công việc khá nhiều nên chưa xuống hoàn trả mặt bằng kịp. Rất xin lỗi anh/chị vì sự bất tiện này. Thông tin của anh/chị đã được chuyển đến bộ phận Trám vá. Sẽ có nhân viên của BWACO hỗ trợ anh/chị trong thời gian sớm nhất có thể. Mong anh/chị thông cảm, xin cảm ơn!";
		_InfoStatus = InformationStatus.idle;
		clearAllContext();
	}
	else if(_InfoStatus == InformationStatus.instruction_payment_methods){
		_result_handle_DoneInformation = "Dạ chính sách của Chính phủ hiện nay là khuyến khích không dùng tiền mặt. Nhân viên của BWACO vẫn hõ trợ thu tiền mặt nếu thời điểm đi ghi gặp chủ nhà, nếu không thu tại thời điểm đó sẽ không quay lại và nhờ nhà mình chủ động thanh toán bằng các hình thức khác ạ. Rất mong nhà mình thông cảm, xin cảm ơn!";
		_InfoStatus = InformationStatus.idle;
		clearAllContext();
	}
	else if (_InfoStatus == InformationStatus.done_info_instruction_IndexWater_report_input){
		if(_PushContextStatus == PushContextStatus.request_IndexWater_report_input){
			_result_handle_DoneInformation = "Anh/chị nhắn giúp dãy số trên mặt đồng hồ nước và hình ảnh chụp mặt đồng hồ. Hệ thống sẽ kiểm tra và nhập chỉ số cho nhà mình."
			_PushContextStatus = PushContextStatus.idle;
		}
		else{
			_result_handle_DoneInformation = "Chỉ số của nhà mình đã được ghi nhận, cảm ơn anh/chị!";
			_InfoStatus = InformationStatus.idle;
			clearPreviousAction();
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_request_IndexWater_date){
		_result_handle_DoneInformation = "Ngày ghi chỉ số của anh/chị là…";
		_InfoStatus = InformationStatus.idle;
		clearPreviousAction();
	}
	else if(_InfoStatus == InformationStatus.done_info_register_NewWatch_install){
		if(arrange_response == 3){
			_result_handle_DoneInformation += "Dạ thông tin của anh/chị đã được ghi nhận. Sẽ có nhân viên của BWACO liên hệ với anh/chị trong thời gian sớm nhất có thể. ";
		}
		var chat_ai = {
			url: "https://api.openai.com/v1/chat/completions" ,
			method: "POST",
			timeout: 5000,
			async: false,
			"headers": {
				"Content-Type": "application/json",
				"Authorization": "Bearer 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",
			},
			"data": JSON.stringify({
				"model": "ft:gpt-3.5-turbo-0613:personal::8wpnDyCL",
				"messages": objectContext["message_history"],
				"temperature": 0,
				"max_tokens": 400,
				"top_p": 1,
				"frequency_penalty": 0,
				"presence_penalty": 0
			}),
		}
		$.ajax(chat_ai).done(function(response) {
			let resp = response.choices[0].message.content.trim();
			console.log(resp);
			resp = resp.replace("hành_động", "action");
			resp = resp.replace("phân_loại", "category");
			resp = resp.replace("số_điện_thoại", "phone_number");
			resp = resp.replace("mã_khách_hàng", "user_id");
			resp = resp.replace("tên_khách_hàng", "user_name");
			resp = resp.replace("địa_chỉ", "address");
			resp = resp.replace("tháng", "month");
			resp = resp.replace("năm", "year");
			resp = resp.replace("mã_đồng_hồ", "number_id");
			resp = resp.replace("chỉ_số_nước", "number_value");
			resp = resp.replace("trả_lời", "response");
			resp = resp.replace("kết_thúc", "end_conversation");
			resp = resp.replace("số_thứ_tự_trả_lời", "arrange_response");
			let json_data = JSON.parse(resp);
			if (json_data["action"] != "") {
				_action = json_data["action"];
				_cache_Data["action"] = json_data["action"];
				objectContext["action"] = json_data["action"];
			}
			if (json_data["category"] != "") {
				_category = json_data["category"];
				_cache_Data["category"] = json_data["category"];
				objectContext["category"] = json_data["category"];
			}
			if (json_data["phone_number"] != "") {
				_phone_number = json_data["phone_number"];
				_cache_Data["phone_number"] = json_data["phone_number"];
				objectContext["phone_number"] = json_data["phone_number"];
			}
			if (json_data["user_id"] != ""){
				_user_id = json_data["user_id"];
				_cache_Data["user_id"] = json_data["user_id"];
				objectContext["user_id"] = json_data["user_id"];
			}
			if (json_data["user_name"] != "") {
				_user_name = json_data["user_name"];
				_cache_Data["user_name"] = json_data["user_name"];
				objectContext["user_name"] =json_data["user_name"];
			}
			if (json_data["address"] != "") {
				_address = json_data["address"];
				_cache_Data["address"] = json_data["address"];
				objectContext["address"] = json_data["address"];
			}
			if (json_data["device_id"] != "") {
				_device_id = json_data["device_id"];
				_cache_Data["device_id"] = json_data["device_id"];
				objectContext["device_id"] = json_data["device_id"];
			}
			if (json_data["index_value"] != "") {
				_index_value = json_data["index_value"];
				_cache_Data["index_value"] = json_data["index_value"];
				objectContext["index_value"] = json_data["index_value"];
			}
			if (json_data["month"] != "") {
				_month = json_data["month"];
				_cache_Data["month"] = json_data["month"];
				objectContext["month"]=json_data["month"];
			}
			if (json_data["year"] != ""){ 
				_year = json_data["year"];
				_cache_Data["year"] = json_data["year"];
				objectContext["year"] = json_data["year"];
			}
			if (json_data["response"] != ""){ 
				_response = json_data["response"];
				_result_handle_DoneInformation += _response;
			}
			if (json_data["end_conversation"] != ""){ 
				_end_conversation = json_data["end_conversation"];
				end_conversation = _end_conversation;
			}
			if (json_data["arrange_response"] != ""){ 
				_arrange_response = json_data["arrange_response"];
				arrange_response = arrange_response;
			}	
			objectContext["message_history"].push(messageAssistant(_result_handle_DoneInformation,_action, _category, _user_id, _device_id, _phone_number, _user_name, _address, _index_value,_month, _year, end_conversation, arrange_response));
			arrange_response++;
		});
	}
	else if(_InfoStatus == InformationStatus.done_info_change_information_contract){
		console.log(_PushContextStatus);
		console.log(flag_rememberInformation.change_information_contract);
		if((_PushContextStatus == PushContextStatus.change_information_contract) && (_PrevActionStatus == ActionStatus.provide_customer_information)){
			_result_handle_DoneInformation = " Anh/chị muốn thay đổi thông tin gì trên hợp đồng cấp nước ạ?";
			flag_rememberInformation.change_information_contract = true;
			_PrevActionStatus = ActionStatus.idle;
		}
		else if((_PushContextStatus == PushContextStatus.change_information_contract) && (flag_rememberInformation.change_information_contract == false)){
			_result_handle_DoneInformation = " Anh/chị muốn thay đổi thông tin gì trên hợp đồng cấp nước ạ?";
			flag_rememberInformation.change_information_contract = true;
			clearAllContext();
		}
		else if ((_PushContextStatus == PushContextStatus.change_information_contract) && (flag_rememberInformation.change_information_contract == true)){
			if(_category == "Đổi tên hợp đồng cá nhân"){
				_result_handle_DoneInformation ="Anh/chị vui lòng chuẩn bị hồ sơ đổi tên trên hợp đồng cấp nước gồm: bản photo Giấy tờ nhà đất đã đứng tên Anh/chị, CCCD của anh/chị. Yêu cầu thay đổi thông tin trên HĐ cấp nước của Anh/chị đã được hệ thống ghi nhận, Anh/chị vui lòng đợi bộ phận chuyên trách liên hệ lại sau. Xin cảm ơn! ";
			}
			else if(_category == "Đổi số điện thoại hợp đồng cá nhân" || _category == "Đổi địa chỉ hợp đồng cá nhân"){
				_result_handle_DoneInformation ="Yêu cầu thay đổi thông tin trên HĐ cấp nước của Anh/chị đã được hệ thống ghi nhận, Anh/chị vui lòng đợi bộ phận chuyên trách liên hệ lại sau. Xin cảm ơn!";
			}
			else if(_category == "Đổi tên hợp đồng doanh nghiệp,công ty"){
				_result_handle_DoneInformation = " Anh/chị vui lòng chuẩn bị hồ sơ đổi tên trên hợp đồng cấp nước gồm (bản photo): Giấy phép hoạt động kinh doanh, CCCD của chủ Doanh nghiệp, Hợp đồng thuê nhà (trên đó có xác nhận của chủ nhà đồng ý cho Công ty mình thay đổi thông tin trên Hóa đơn nước) và Giấy đề nghị thay đổi thông tin (trong đó ghi rõ thông tin hiện tại và thông tin cần thay đổi, có chữ ký của chủ DN và đóng dấu đỏ) . Yêu cầu thay đổi thông tin trên HĐ cấp nước của Anh/chị đã được hệ thống ghi nhận, Anh/chị vui lòng đợi bộ phận chuyên trách liên hệ lại sau. Xin cảm ơn!";
			}
			else if(_category == "Đổi số điện thoại hợp đồng doanh nghiệp,công ty" || _category == "Đổi địa chỉ hợp đồng doanh nghiệp,công ty"){
				_result_handle_DoneInformation = "Yêu cầu thay đổi thông tin trên HĐ cấp nước của Anh/chị đã được hệ thống ghi nhận, Anh/chị vui lòng đợi bộ phận chuyên trách liên hệ lại sau. Xin cảm ơn!";		
			}
			_InfoStatus = InformationStatus.idle;
			clearAllContext();
		}
		
	}
	
	return _result_handle_DoneInformation;
}

//===========================================================================

function fetchMessages() {
	if(_InfoStatus == InformationStatus.info_reflect_quality 		  			 || _InfoStatus == InformationStatus.info_reflect_supply 			  	     ||
	   _InfoStatus == InformationStatus.info_request_watch_repair 	 			|| _InfoStatus == InformationStatus.info_request_pipe_repair 	 		   || 
	   _InfoStatus == InformationStatus.info_request_valve_repair	 			|| _InfoStatus == InformationStatus.info_request_area_refund 			   ||
	   _InfoStatus == InformationStatus.info_request_invoices        			|| _InfoStatus == InformationStatus.info_instruction_IndexWater_report     ||
	   _InfoStatus == InformationStatus.info_request_IndexWater_date 			|| _InfoStatus == InformationStatus.info_request_watch_move_lift   	   	   ||
	   _InfoStatus == InformationStatus.info_request_IndexWatch_check_explain   || _InfoStatus == InformationStatus.info_request_watch_box_secure          ){
		if(isValidCustomerID(messages) != false){
			messages = isValidCustomerID(messages);
			_cache_Data["user_id_sentence"]=messages;
			console.log("CACHE USERID: "+_cache_Data["user_id_sentence"]);
		}
		if(_PrevActionStatus == ActionStatus.provide_customer_information){
			if(isValidPhoneNumber(messages) != false){
				messages = isValidPhoneNumber(messages);
				ask_more = 1;
			}
		}
		else if(_PrevActionStatus == ActionStatus.request_invoices){
			objectContext["message_history"].push(messageUser(messages));
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_reflect_quality 			 || _InfoStatus == InformationStatus.done_info_reflect_supply					|| 
			_InfoStatus == InformationStatus.done_info_request_watch_repair     || _InfoStatus == InformationStatus.done_info_request_pipe_repair 		      || 
	   		_InfoStatus == InformationStatus.done_info_request_valve_repair 	|| _InfoStatus == InformationStatus.done_info_request_area_refund 			  ||
	   		_InfoStatus == InformationStatus.done_info_request_invoices 		|| _InfoStatus == InformationStatus.done_info_request_IndexWatch_check_explain||
	   		_InfoStatus == InformationStatus.done_info_request_IndexWater_date  || _InfoStatus == InformationStatus.done_info_change_information_contract	  ||
			_InfoStatus == InformationStatus.done_info_request_watch_move_lift  || _InfoStatus == InformationStatus.done_info_request_watch_box_secure         ){
		if(isValidPhoneNumber(messages) != false){
			messages = isValidPhoneNumber(messages);	
			_cache_Data["phone_number_sentence"]= messages;
			console.log("CACHE PHONE: "+_cache_Data["phone_number_sentence"]);
		}
		// if(_PrevActionStatus == ActionStatus.request_pipe_repair){
		// 	if(isValidAddress(messages) != false){
		// 		messages = isValidAddress(messages);
		// 		console.log("CACHE ADDRESS: "+ messages);
		// 	}
		// }
		
	}
	else if(_InfoStatus == InformationStatus.info_register_NewWatch_install){
		let validInfo = validateAndExtractInfo(messages, _InfoStatus);
		if (validInfo != false){
			validInfo = isValidCustomerName(validInfo.customerName) + ", " + isValidPhoneNumber(validInfo.phoneNumber) + ", " + isValidAddress(validInfo.address);
			messages = validInfo;
		}
	}
	else if(_InfoStatus == InformationStatus.done_info_instruction_IndexWater_report_input){
		if(isValidIndexWater(messages) != false){
			messages = isValidIndexWater(messages);
		}
	}
	else if(_InfoStatus == InformationStatus.info_change_information_contract){
		let validInfo = validateAndExtractInfo(messages, _InfoStatus);
		if (validInfo != false){
			if(validInfo.customerID  && validInfo.address){
				validInfo = isValidCustomerID(validInfo.customerID) + ", " + isValidAddress(validInfo.address);
			}
			else if(validInfo.customerID){
				validInfo = isValidCustomerID(validInfo.customerID);
			}
			else if(validInfo.address){
				validInfo = isValidAddress(validInfo.address);
			}
			messages = validInfo;
		}
	}
	console.log("Khách hàng: " + messages);
	var chat_ai = {
		url: "http://lpnserver.net:51087/chat/url?m="+modelID+"&k="+apiKey+"&c=" + messages,
		method: "GET",
		timeout: 5000
	};
	$.ajax(chat_ai).done(function(response) {
		console.log("REST API SERVER "+response);
		let resp = response;
		resp = resp.replace("hành_động", "action");
		resp = resp.replace("phân_loại", "category");
		resp = resp.replace("số_điện_thoại", "phone_number");
		resp = resp.replace("mã_khách_hàng", "user_id");
		resp = resp.replace("tên_khách_hàng", "user_name");
		resp = resp.replace("địa_chỉ", "address");
		resp = resp.replace("tháng", "month");
		resp = resp.replace("năm", "year");
		resp = resp.replace("mã_đồng_hồ", "number_id");
		resp = resp.replace("chỉ_số_nước", "number_value");
		let json_data = JSON.parse(resp);
		if (json_data["action"] != "") {
			_action = json_data["action"];
			_cache_Data["action"] = json_data["action"];
			objectContext["action"] = json_data["action"];
		}
		if (json_data["category"] != "") {
			_category = json_data["category"];
			_cache_Data["category"] = json_data["category"];
			objectContext["category"] = json_data["category"];
		}
		if (json_data["phone_number"] != "") {
			_phone_number = json_data["phone_number"];
			_cache_Data["phone_number"] = json_data["phone_number"];
			objectContext["phone_number"] = json_data["phone_number"];
		}
		if (json_data["user_id"] != ""){
			_user_id = json_data["user_id"];
			_cache_Data["user_id"] = json_data["user_id"];
			objectContext["user_id"] = json_data["user_id"];
		}
		if (json_data["user_name"] != "") {
			_user_name = json_data["user_name"];
			_cache_Data["user_name"] = json_data["user_name"];
			objectContext["user_name"] =json_data["user_name"];
		}
		if (json_data["address"] != "") {
			_address = json_data["address"];
			_cache_Data["address"] = json_data["address"];
			objectContext["address"] = json_data["address"];
		}
		if (json_data["device_id"] != "") {
			_device_id = json_data["device_id"];
			_cache_Data["device_id"] = json_data["device_id"];
			objectContext["device_id"] = json_data["device_id"];
		}
		if (json_data["index_value"] != "") {
			_index_value = json_data["index_value"];
			_cache_Data["index_value"] = json_data["index_value"];
			objectContext["index_value"] = json_data["index_value"];
		}
		if (json_data["month"] != "") {
			_month = json_data["month"];
			_cache_Data["month"] = json_data["month"];
			objectContext["month"]=json_data["month"];
		}
		if (json_data["year"] != ""){ 
			_year = json_data["year"];
			_cache_Data["year"] = json_data["year"];
			objectContext["year"] = json_data["year"];
		}

		let _ActionStatus = getActionStatus(_action);

		if((_PrevActionStatus == ActionStatus.reflect_water_quality) && (_ActionStatus != ActionStatus.provide_customer_information) && (_ActionStatus != ActionStatus.discuss_information)){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PrevActionStatus == ActionStatus.request_watch_repair) && (_ActionStatus != ActionStatus.discuss_information) &&(_ActionStatus != ActionStatus.explain_NewWatch_install_fee) && (_ActionStatus != ActionStatus.provide_customer_information)){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if ((_PrevActionStatus == ActionStatus.request_watch_repair) && (_ActionStatus != ActionStatus.discuss_information)&& (_ActionStatus != ActionStatus.provide_customer_information)){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PrevActionStatus == ActionStatus.instruction_payment_methods) && (_ActionStatus != ActionStatus.discuss_information) ){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PrevActionStatus == ActionStatus.request_watch_box_secure) &&(_ActionStatus != ActionStatus.explain_NewWatch_install_fee) && (_ActionStatus != ActionStatus.provide_customer_information) ){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PrevActionStatus == ActionStatus.request_watch_move_lift)&&(_ActionStatus != ActionStatus.explain_NewWatch_install_fee) && (_ActionStatus != ActionStatus.provide_customer_information) && (_ActionStatus != ActionStatus.discuss_information)){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		//console.log("Check message front history: " + JSON.stringify(objectContext["message_history"] ));

		if(_PushContextStatus == PushContextStatus.inflect_color_water      || _PushContextStatus == PushContextStatus.request_watch_repair	  ||
		   _PushContextStatus == PushContextStatus.register_NewWatch_install || _PushContextStatus == PushContextStatus.request_watch_move_lift){
			objectContext["message_history"].push(messageUser(messages));
		}
				
		result_output = "";
		console.log("Check action: " + _ActionStatus);

		switch (_ActionStatus) {
			case ActionStatus.idle:
				break;
			case ActionStatus.greeting:
                if(_category == "Xin chào"){
                    result_output = "Xin chào, BWACO có thể giúp gì cho anh/chị ạ?"
                }
                else if (_category == "Kết thúc trò chuyện"){
                    result_output = "BWACO tạm biệt quý khách. Cảm ơn anh/chị đã gọi đến tổng đài, cần hỗ trợ thêm thông tin anh/chị vui lòng liên hệ với chúng tôi. Xin cảm ơn!";
                    
                }
				clearAllContext();
				break;
            case ActionStatus.say_thanks:
                result_output = "Cảm ơn anh/chị đã gọi đến tổng đài, cần hỗ trợ thêm thông tin anh/chị vui lòng liên hệ với chúng tôi. Xin cảm ơn!";
				clearAllContext();
                break;
			case ActionStatus.reflect_water_quality:
				if(_category == "Nước đục" || _category == "Nước có mùi"){
					if(_cache_Data["user_id"] != ""){
						_InfoStatus = InformationStatus.info_reflect_quality;
						if(_category == "Nước đục"){
							_PushContextStatus = PushContextStatus.inflect_color_water;
							_PrevActionStatus = ActionStatus.reflect_water_quality;
							objectContext["message_history"].push(messageUser(messages));
							objectContext["message_history"].push(messageFirst_UserID(_action, _category));
							arrange_response++;
							flag_rememberInformation.reflect_water_quality = true;
							result_output = handle_RemainInformation(objectContext ,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
																	_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
							result_output = handle_DoneInformation (objectContext,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
																	_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
						}
						else{
							_InfoStatus = InformationStatus.done_info_reflect_quality;
							result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
																	_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
						}
						
					}
					else{
						result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
						_InfoStatus = InformationStatus.info_reflect_quality;
						if(_category == "Nước đục"){
							_PushContextStatus = PushContextStatus.inflect_color_water;
							_PrevActionStatus = ActionStatus.reflect_water_quality;
							objectContext["message_history"].push(messageUser(messages));
							_cache_Data["question_user_id"] = messageAssistant(result_output, _action, _category, _user_id, _device_id, _phone_number,
																				_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
							objectContext["message_history"].push(_cache_Data["question_user_id"]);
							arrange_response++;
						}
					}
				}
				else if (_category == "Nước có bọt trắng,bọt trắng đục"){
					result_output = "Đây chỉ là hiện tượng bọt khí lọt vào đường ống, không ảnh hưởng đến chất lượng nước, anh/chị yên tâm ạ. Xin cảm ơn!";
					clearObjContext();
				}

				break;
			case ActionStatus.reflect_water_supply:
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_reflect_supply;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_reflect_supply;
				}
				break;
			case ActionStatus.request_watch_repair:
				_InfoStatus = InformationStatus.info_request_watch_repair;
				_PushContextStatus = PushContextStatus.request_watch_repair;
				_PrevActionStatus = ActionStatus.request_watch_repair;
				if(_cache_Data["user_id"] != ""){
					objectContext["message_history"].push(messageUser(messages));
					objectContext["message_history"].push(messageFirst_UserID(_action, _category));
					arrange_response++;
					flag_rememberInformation.request_watch_repair = true;
					result_output = handle_RemainInformation(objectContext ,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
					result_output = handle_DoneInformation (objectContext,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					objectContext["message_history"].push(messageUser(messages));
					objectContext["message_history"].push(messageAssistant(result_output, _action, _category, _user_id, _device_id, _phone_number,
																			 _user_name, _address, _index_value,_month, _year,end_conversation, arrange_response));
					arrange_response++;
				}
				break;
			case ActionStatus.request_watch_move_lift:
				_InfoStatus = InformationStatus.info_request_watch_move_lift;
				_PushContextStatus = PushContextStatus.request_watch_move_lift;
				_PrevActionStatus = ActionStatus.request_watch_move_lift;
				if(_cache_Data["user_id"] != ""){
					objectContext["message_history"].push(messageUser(messages));
					objectContext["message_history"].push(messageFirst_UserID(_action, _category));
					arrange_response++;
					flag_rememberInformation.request_watch_move_lift = true;
					result_output = handle_RemainInformation(objectContext ,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
					result_output = handle_DoneInformation (objectContext,"Cung cấp thông tin khách hàng", "Thông tin khách hàng", _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					objectContext["message_history"].push(messageUser(messages));
					objectContext["message_history"].push(messageAssistant(result_output, _action, _category, _user_id, _device_id, _phone_number,
																			 _user_name, _address, _index_value,_month, _year,end_conversation, arrange_response));
					arrange_response++;
				}
				
				break;
			case ActionStatus.request_watch_box_secure:
				_PrevActionStatus = ActionStatus.request_watch_box_secure;
				_PushContextStatus = PushContextStatus.request_watch_box_secure;
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_watch_box_secure;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_watch_box_secure;
				}
				break;
			case ActionStatus.request_pipe_repair:
				_PrevActionStatus = ActionStatus.request_pipe_repair;
				_PushContextStatus = PushContextStatus.request_pipe_repair;
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_pipe_repair;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_pipe_repair;
				}
				
				break;
			case ActionStatus.request_IndexWatch_check_explain:
				_PrevActionStatus = ActionStatus.request_IndexWatch_check_explain;
				_PushContextStatus = PushContextStatus.request_IndexWatch_check_explain;
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_IndexWatch_check_explain;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_IndexWatch_check_explain;
				}
				break;
			case ActionStatus.request_valve_repair:
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_valve_repair;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_valve_repair;
				}
				break;
			case ActionStatus.request_area_refund:
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_area_refund;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_area_refund;
				}
				break;
			case ActionStatus.instruction_payment_methods:
				result_output = "Quý khách hàng có thể thanh toán thông qua: các ngân hàng (danh sách 10 ngân hàng đăng ký nhờ thu tiền nước: Vietcombank, BIDV, Viettinbank, Sacombank, Agribank, VIB, Mbank, ACB, MSB, Abbank...), " +
					"các điểm thu hộ, các kênh trung gian, ví điện tử(các ví điện tử có thể thanh toán tiền nước như: Momo, Zalopay,Payoo, Vnpay, Viettel...)." +
					" Để biết thêm chi tiết vui lòng truy cập vào website của Công ty CP cấp nước Bà Rịa Vũng Tàu: http://www.bwaco.com.vn. Xin chân thành cảm ơn!";
				_PrevActionStatus = ActionStatus.instruction_payment_methods;
				_InfoStatus =  InformationStatus.instruction_payment_methods;
				flag_result = true;
				break;
			case ActionStatus.request_invoices:
				if (_cache_Data["user_id"] == ""){
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_invoices;
				}
				else{
					if (_cache_Data["year"] != "" && _cache_Data["month"] == ""){
						_PrevActionStatus = ActionStatus.request_invoices;
						_InfoStatus = InformationStatus.info_request_invoices;
						result_output = "Anh/chị vui lòng cung cấp tháng mà anh/chị muốn kiểm tra";
						objectContext["message_history"].push(messageAssistant(result_output));
						flag_result = false;
					}
					else {
						_InfoStatus = InformationStatus.idle;
						if (_cache_Data["month"] == ""){
							if(_date.getDay() <= 25){
								_month = String(_date.getMonth());
							}
							else{
								_month = String(_date.getMonth() + 1);
							}
							
						}
						_year = String(_date.getFullYear());
						console.log("Check month: " +_month);
						if (_cache_Data["month"] == "-1" ) {
							let cur_month = _date.getMonth() + 1;
							let cur_year = _date.getFullYear();
							if (cur_month == 1) {
								cur_month = 12;
								cur_year = cur_year - 1;
							} else {
								cur_month = cur_month - 1;
							}
							_month = String(cur_month);
							_year = String(cur_year);
						}
						if ((parseInt(_month) > (_date.getMonth() + 1)) && ((_year == "") || (parseInt(_year) >= _date.getFullYear()))) {
							_year = String(_date.getFullYear() - 1);
						}
						console.log("Check month: " +_month);
						var water_info = {
							url: "http://lpnserver.net:51087/bwaco?id=" + _user_id + "&m=" + _month + "&y=" + _year,
							method: "GET",
							timeout: 5000,
							async: false
						}
						$.ajax(water_info).done(function(res) {
							let len = res.length;
							result_output = "Hoá đơn tiền nước của nhà mình như sau:\n\n";
							res.forEach(element => {
								result_output += "(ID-" + element["idkh"] + ") Tên Khách Hàng: " + element["tenKhachHang"] + ", Mã KH: " + element["maKhachHang"] + "\n\n";
								result_output += "* Hoá đơn nước tháng " + String(element["thang"]) + " năm " + String(element["nam"]) + "\n\n";
								result_output += "* Chỉ số đầu: " + String(element["chiSoDau"]) + ", chỉ số cuối: " + String(element["chiSoCuoi"]) + ", tổng khối lượng: " + String(element["khoiluong"]) + "\n\n";
								result_output += "* Tổng tiền: " + element["tongTien"] + "đ\n\n";
								if (element["hetNo"] == true) {
									result_output += "* Tình trạng hoá đơn: ĐÃ THANH TOÁN";
								} else {
									result_output += "* Tình trạng hoá đơn: CHƯA THANH TOÁN";
								}
							});
						});
					}
					
				}
				
				break;
			case ActionStatus.request_IndexWater_report_input:
				_PrevActionStatus = ActionStatus.request_IndexWater_report_input;
				_PushContextStatus = PushContextStatus.request_IndexWater_report_input;
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_instruction_IndexWater_report_input;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
				_InfoStatus = InformationStatus.info_instruction_IndexWater_report;
				}	
				
				break;
			case ActionStatus.instruction_IndexWaterString_input:
				result_output = "Anh/Chị vui lòng nhập dãy số màu đen trên mặt đồng hồ nước. Xin cảm ơn!";
				_InfoStatus = InformationStatus.done_info_instruction_IndexWater_report_input;
				break;
			case ActionStatus.explain_bill_period:
				result_output = "Cảm ơn anh, chị đã gọi điện tới tổng đài, kỳ hóa đơn được tính từ ngày ghi chỉ số nước của tháng này tới ngày ghi chỉ số nước của tháng sau ạ.";
				break;
			case ActionStatus.request_IndexWater_date:
				if(_cache_Data["user_id"] != ""){
					_InfoStatus = InformationStatus.done_info_request_IndexWater_date;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
									_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_request_IndexWater_date;
				}

				break;
			case ActionStatus.explain_temporary_calculate:
				result_output = "Dạ. Khi đến ngày ghi chỉ số nước, nếu nhân viên không tiếp cận được đồng hồ nước do nhà đóng cửa, nhà có trẻ nhỏ, người lớn tuổi không cung cấp được chỉ số nước thì Công ty cấp nước Bà Rịa vũng tàu sẽ tạm tính chi phí sử dụng nước bằng trung bình 3 kỳ gần nhất.";
				break;
			case ActionStatus.research_water_price:
				result_output = "Dạ. Trong năm 2024 định mức giá nước sinh hoạt gia đình 10m3 đầu là 9.400 đồng, từ 10-20m3 là 12.500 đồng, trên 20m3 là: 13.500 đồng.Hộ có kinh doanh hoặc Công ty là 20.200 đồng. Các giá trên chưa bao gồm thuế và phí dịch vụ thoát nước. Để biết thêm chi tiết quý khách vui lòng truy cập website: http://www.bwaco.com.vn, Xin chân thành cảm ơn!";
				break;
			case ActionStatus.explain_business_water_price:
				result_output = " Dạ, theo thông tư 728/QĐ-TCT-KDDVKH thì đối tượng sử dụng nước có buôn bán, kinh doanh dịch vụ sẽ được điều chỉnh biểu giá nước kinh doanh.";
				break;
			case ActionStatus.research_water_tax:
				result_output = "Dạ thuế GTGT tiền nước là 5% ạ.";
				break;
			case ActionStatus.research_service_drainage_fee:
				result_output = "Dạ, đây là khoản thu của UBND Tỉnh nhằm bù đắp một phần chi phí thường xuyên và không thường xuyên để xây dựng, bảo dưỡng môi trường và hệ thống thoát nước. UBND tỉnh Br-VT  ban hành trong quyết định số: 17/2022/QĐ-UBND ngày 22/09/2022 về việc ban hành giá dịch vụ thoát nước trên địa bàn thành phố Vũng tàu. Công ty CP cấp nước BR-VT là đơn vị thu hộ, để biết thêm chi tiết quý khách vui lòng truy cập website: http://www.bwaco.com.vn. Xin chân thành cảm ơn!";
				break;
			case ActionStatus.research_environmental_fee:
				result_output = "Dạ, đây là khoản thu của UBND Tỉnh nhằm bù đắp một phần chi phí thường xuyên và không thường xuyên để xây dựng, bảo dưỡng môi trường và hệ thống thoát nước. UBND tỉnh Br-VT  ban hành trong quyết định số: 17/2022/QĐ-UBND ngày 22/09/2022 về việc ban hành giá dịch vụ thoát nước trên địa bàn thành phố Vũng tàu. Công ty CP cấp nước BR-VT là đơn vị thu hộ, để biết thêm chi tiết quý khách vui lòng truy cập website: http://www.bwaco.com.vn. Xin chân thành cảm ơn!";
				break;
			case ActionStatus.register_NewWatch_install:
				result_output = "Dạ, hồ sơ lắp mới bao gồm: bản photo Giấy chủ quyền nhà/đất, căn cước công dân của chủ hộ. Anh/chị vui lòng cung cấp địa chỉ lắp đặt đồng hồ, tên chủ hộ, số điện thoại ạ.";
				_InfoStatus = InformationStatus.info_register_NewWatch_install;
				_PushContextStatus = PushContextStatus.register_NewWatch_install;
				_PrevActionStatus = ActionStatus.register_NewWatch_install;
				objectContext["message_history"].push(messageUser(messages));
				objectContext["message_history"].push(messageAssistant(result_output, _action, _category, _user_id, _device_id, _phone_number,
																		_user_name, _address, _index_value,_month, _year,end_conversation, arrange_response));
				arrange_response++;
				break;
			case ActionStatus.explain_NewWatch_install_same_location:
				result_output = "Dạ. Theo quy định một bất động sản chỉ được gắn một đồng hồ nước. Trường hợp xây căn nhà thứ 2 trên cùng một thửa đất nếu lắp thêm đồng hồ khách hàng sẽ tự trả chi phí phát sinh ạ.";
				break;
			case ActionStatus.explain_NewWatch_install_fee:
				if(_PrevActionStatus == ActionStatus.request_watch_repair){
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				else if(_PrevActionStatus == ActionStatus.request_watch_box_secure) {
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				else if(_PrevActionStatus == ActionStatus.request_watch_move_lift){
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				else{
					result_output= "Nếu giấy tờ nhà đất hợp lệ, BWACO sẽ lắp miễn phí 1 đồng hồ dưới 10m ống. Các trường hợp tính phí khi lắp đồng hồ mới sẽ căn cứ vào khảo sát thự tế và chiết tính cụ thể ạ.";
				}
				break;
			case ActionStatus.change_information_contract:
				if(_cache_Data["user_id"] != ""){
					_PushContextStatus = PushContextStatus.change_information_contract;
					_InfoStatus = InformationStatus.done_info_change_information_contract;
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);		
				}
				else{
					result_output = "Anh/chị vui lòng cung cấp mã khách hàng";
					_InfoStatus = InformationStatus.info_change_information_contract;
				}
				break;
			case ActionStatus.provide_customer_information:
				if (flag_result == false){
					result_output = handle_RemainInformation(objectContext ,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
					flag_result = true;
				}
				else{
					result_output = handle_DoneInformation (objectContext,_action, _category, _user_id, _device_id, _phone_number, 
															_user_name, _address, _index_value,_month, _year, end_conversation, arrange_response);
				}
				//_PrevActionStatus = ActionStatus.provide_customer_information;
				break;
			case ActionStatus.forget_personal_information:
				if((_category == "Quên mã khách hàng" || _category == "Quên thông tin chung") && _ForgetStatus == ForgetInformationStatus.info_forget_user_id){
					_ForgetStatus = ForgetInformationStatus.info_forget_user_name_address;
					result_output += "Vui lòng cho tôi xin họ tên đồng hồ nước hoặc địa chỉ của đồng hồ nước.";
				}
				else if((_category == "Quên tên khách hàng" || _category == "Quên địa chỉ" || _category == "Quên thông tin chung") && _ForgetStatus == ForgetInformationStatus.info_forget_user_name_address){
					_ForgetStatus = ForgetInformationStatus.info_forget_watch_id;
					result_output += "Vui lòng cho tôi xin mã đồng hồ (Mã đồng hồ được in trên viền nhựa bao xung quanh mặt đồng hồ). ";
				}
				else if((_category == "Quên mã đồng hồ" || _category == "Quên thông tin chung") && _ForgetStatus == ForgetInformationStatus.info_forget_watch_id){
					_ForgetStatus = ForgetInformationStatus.info_forget_user_id;
					result_output += "Quý khách vui lòng gọi trực tiếp đến tổng đài để nhận được tư vấn."
				}
				break;
			case ActionStatus.discuss_information:
				result_output = handle_DoneInformation(objectContext, _action, _category, _user_id, _device_id, _phone_number, 
														_user_name, _address, _index_value,_month, _year,_end_conversation, _arrange_response);

				break;
            case ActionStatus.default_error:
                result_output = "Tôi chưa hiểu câu hỏi của anh/chị, vui lòng thử lại.";
                break;

		}
		// console.log("Prev: " + _PrevActionStatus);
		console.log("Check info status: " + _InfoStatus);
		console.log("Check prev action: " + _PrevActionStatus);
		//console.log("Check ask more: " + ask_more);
		console.log("Check message history: " + JSON.stringify(objectContext["message_history"] ));
		console.log("Flag result: " + flag_result);
		console.log("End conversation: " + end_conversation);
		console.log("Arrange: " + arrange_response);
		if((_PushContextStatus == PushContextStatus.inflect_color_water) && (end_conversation == "true") && (arrange_response == "6")){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PushContextStatus == PushContextStatus.request_watch_repair) && (end_conversation == "true") && (arrange_response == "7")){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PushContextStatus == PushContextStatus.register_NewWatch_install) && (end_conversation == "true") && (arrange_response == "5")){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		else if((_PushContextStatus == PushContextStatus.request_watch_move_lift) && (end_conversation == "true") && (arrange_response == "7")){
			clearAllContext();
			_InfoStatus = InformationStatus.idle;
		}
		console.log("Check message clear history: " + JSON.stringify(objectContext["message_history"] ));
		if(result_output == ""){
			result_output = "Tôi chưa hiểu câu hỏi của anh/chị, vui lòng thử lại.";
		}
		let message = result_output;
		const htmlText = window.markdownit().render(message);
		const botMessageHtml = '<pre><div class="message left-side" id="' + CryptoJS.MD5(htmlText) + '">' + htmlText + '</div><i class="far fa-clipboard ml-1 btn btn-outline-dark" id="' + CryptoJS.MD5(htmlText) + '-copy"></i></pre>';

		chatbox.append(botMessageHtml);

		// Add event listener to the copy icon
		var copyIcon = document.getElementById(CryptoJS.MD5(htmlText) + '-copy');
		var copyText = document.getElementById(CryptoJS.MD5(htmlText));

		copyIcon.addEventListener("click", function() {
			var tempTextarea = document.createElement("textarea");
			tempTextarea.value = copyText.textContent;
			document.body.appendChild(tempTextarea);
			tempTextarea.select();
			document.execCommand("copy");
			document.body.removeChild(tempTextarea);

			// Display "Copied!" popup
			var copyPopup = document.getElementById("copy-popup");
			copyPopup.style.display = "block";
			setTimeout(function() {
			copyPopup.style.display = "none";
			}, 1000); // Display for 1 second
		});

		chatbox.animate({ scrollTop: 20000000 }, "slow");
		sendButton.val("Gửi");
		sendButton.prop("disabled", false);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		sendButton.val("Error");
		let errorText = "Error: " + jqXHR.responseJSON.error.message;
		let errorMessage = '<pre><div class="message left-side  text-danger" >' + errorText + '</div></pre>';
		chatbox.append(errorMessage);
		chatbox.animate({ scrollTop: 20000000 }, "slow");
	});
	
}

