;
export function isValidCustomerID(customerID) {
	// user id with 7 or 8 items with 1 character or not
	let makhachhang =  (/^[0-9]*[a-zA-Z]?[0-9]*$/.test(customerID) && (customerID.length === 7 || customerID.length === 8))? ("mã khách hàng: " + customerID) : false;
	return makhachhang;
}
export function isValidPhoneNumber(phoneNumber) {
	// check phone number with 10 number with +84 == 0 follow VN region
	let sodienthoai = (/^(\+?84|\d)\d{9}$/.test(phoneNumber) || /^0\d{9}$/.test(phoneNumber))? ("số điện thoại: " + phoneNumber) : false;
	return sodienthoai;
}
export function isValidCustomerName(customerName) {
	// user name with characters without number
	let tenkhachhang = (/^[^0-9]+$/.test(customerName))? ("tên khách hàng: " + customerName) : false;
	return tenkhachhang;
}
export function isValidAddress(address) {
	// address with characters and numbers
	let diachi = (/[A-Za-z].*\d|\d.*[A-Za-z]/.test(address))? ("địa chỉ: " + address) : false;
	return diachi;
}
export function isValidIndexWater(index_value) {
	// check index value with 3 numbers
	let chisonuoc = (/^\d{3}$/.test(index_value))? ("chỉ số nước: " + index_value) : false;
	return chisonuoc;
}
export function isValidWatchID(watch_id) {
  // check watch id with 5 item without space and symbol
   let madongho = (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{5}$/.test(watch_id))? ("mã đồng hồ: "+watch_id) : false;
   return madongho;
}

