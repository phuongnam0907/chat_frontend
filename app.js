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

		fetchMessage(message);
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

function fetchMessage(message_) {
	var chat_ai = {
		url: 'http://localhost:51087/wrapper?id=' + _guestId + '&message=' + message_,
		method: "GET",
		timeout: 1000,
		async: false,
		json:true
	}
	$.ajax(chat_ai).done(function (response) {
		console.log(response)
		let result = response;
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
	}).fail(function(jqXHR, textStatus, errorThrown) {
		sendButton.val("Error");
		let errorText = "Error: " + jqXHR.responseJSON.error.message;
		let errorMessage = '<pre><div class="message left-side  text-danger" >' + errorText + '</div></pre>';
		chatbox.append(errorMessage);
		chatbox.animate({ scrollTop: 20000000 }, "slow");
	});
}