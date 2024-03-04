const _date = new Date();

export const myList = [	"1984500", "1608984", "026B543", "188B083", "6829951", "1236746", "0238303", "9039930", "9039933", "6667739", 
                        "6386514", "6929287", "6680312", "1839408", "188A503", "188A346", "6185089", "026B287", "9079710", "6940625", 
                        "1905237", "1869715", "4260124", "6869143", "6185068", "6129734", "6549250", "6809579", "9030058", "6720282", 
                        "8047390", "8120233", "8046838", "8046839", "9030008", "8120232", "8086969", "8039729", "8054262", "9040001", 
                        "8046847", "9060007", "9060029", "8027264", "9060001", "9060019", "9060027", "9070592", "9020015", "9086181", "8221905"];



export function getCheckCustomer(_user_id,result){
	let result_ = "";
	let _month = String(_date.getMonth());
	let _year = String(_date.getFullYear());
	var water_info = {
		url: "http://lpnserver.net:51087/bwaco?id=" + _user_id + "&m=" + _month + "&y=" + _year,
		method: "GET",
		timeout: 5000,
		async: false
	}
	$.ajax(water_info).done(function(res) {
		let len = res.length;
		res.forEach(element => {
			result_ += "Vâng, "+"mã khách hàng của nhà mình là: " + element["maKhachHang"] +", họ tên đồng hồ nước là: " + element["tenKhachHang"] + ", địa chỉ là: ....\n\n";
			result = result_;
		});
	});
	return result;
}	

export function checkDB_CustomerID(_CustomerID, myList){
	return myList.includes(_CustomerID, myList);
}

