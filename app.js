const url = new URL(window.location.href);
const key = url.searchParams.get('key');
const chatbox = $("#chatbox");
const userInput = $("#userInput");
const sendButton = $("#sendButton");
const clearContent = $("#clear-content");
const _date = new Date();
const _guestId = Math.floor(100000 + Math.random() * 900000);

clearContent.on("click", () => {
	chatbox[0].innerHTML = '';
});

sendButton.on("click", () => {
	const message = userInput.val();
	if (message) {
		const displaytext = window.markdownit().render(message);
		let userMessageHtml = '<pre><div class="message right-side "  >' + displaytext + '</div></pre>';
		chatbox.append(userMessageHtml);
		chatbox.animate({ scrollTop: 20000000 }, "slow");
		userInput.val("");
		sendButton.val("Đang gửi...");
		sendButton.prop("disabled", true);

		let result = sendMsg(message);
		const htmlText = window.markdownit().render(result);
		const botMessageHtml = '<pre><div class="message left-side" id="' + CryptoJS.MD5(htmlText) + '">' + htmlText + '</div><i class="far fa-clipboard ml-1 btn btn-outline-dark" id="' + CryptoJS.MD5(htmlText) + '-copy"></i></pre>';

		chatbox.append(botMessageHtml);

		// Add event listener to the copy icon
		var copyIcon = document.getElementById(CryptoJS.MD5(htmlText) + '-copy');
		var copyText = document.getElementById(CryptoJS.MD5(htmlText));

		copyIcon.addEventListener("click", function () {
			var tempTextarea = document.createElement("textarea");
			tempTextarea.value = copyText.textContent;
			document.body.appendChild(tempTextarea);
			tempTextarea.select();
			document.execCommand("copy");
			document.body.removeChild(tempTextarea);

			// Display "Copied!" popup
			var copyPopup = document.getElementById("copy-popup");
			copyPopup.style.display = "block";
			setTimeout(function () {
				copyPopup.style.display = "none";
			}, 1000); // Display for 1 second
		});

		chatbox.animate({ scrollTop: 20000000 }, "slow");
		sendButton.val("Gửi");
		sendButton.prop("disabled", false);
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


function sendMsg(message_) {
	let result = message_;

	return result;
}