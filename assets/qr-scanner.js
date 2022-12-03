// const qrcode = qrcode;

const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");

const qrResult = document.getElementById("qr-result");
const outputData = document.getElementById("outputData");
const btnScanQR = document.getElementById("btn-scan-qr");
const audioOk = new Audio('./assets/sound/ok.mp3');
const audioErr = new Audio('./assets/sound/error-sound.mp3');

let scanning = false;

qrcode.callback = res => {
    if (res) {
        // outputData.innerText = res;
        scanning = false;
        const arr = res.split('&');

        if (arr.length == 2) {
            var formdata = new FormData();
            formdata.append("no_pendaftaran", arr[0]);
            formdata.append("jenjang", arr[1]);

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };

            fetch("https://w.nfbsnet.id/api/v1/antrian", requestOptions)
                .then(response => response.json())
                .then(function (result) {
                    console.log(result);
                    if (result.success) {
                        outputData.innerHTML = `No. Antrian <strong>${result.data.no_antrian}</strong>`;
                        audioOk.play();
                        setTimeout(() => qrResult.hidden = true, 10000);
                    } else {
                        outputData.innerText = result.message;
                        audioErr.play();
                        setTimeout(() => qrResult.hidden = true, 5000);
                    }
                })
                .catch(error => console.log('error', error));
        } else {
            outputData.innerText = 'Oops... jangan iseng';
            audioErr.play();
            setTimeout(() => qrResult.hidden = true, 5000);
        }

        video.srcObject.getTracks().forEach(track => {
            track.stop();
        });

        qrResult.hidden = false;
        canvasElement.hidden = true;
        btnScanQR.hidden = false;
    }
};

btnScanQR.onclick = () => {
    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(function (stream) {
            scanning = true;
            qrResult.hidden = true;
            btnScanQR.hidden = true;
            canvasElement.hidden = false;
            video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            video.srcObject = stream;
            video.play();
            tick();
            scan();
        });
};

function tick() {
    canvasElement.height = video.videoHeight;
    canvasElement.width = video.videoWidth;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    scanning && requestAnimationFrame(tick);
}

function scan() {
    try {
        qrcode.decode();
    } catch (e) {
        setTimeout(scan, 300);
    }
}
