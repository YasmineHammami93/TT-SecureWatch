const axios = require('axios');

async function testMLService() {
    const features = {
        duration: 5.5,
        proto: "tcp",
        service: "http",
        conn_state: "SF",
        src_pkts: 10,
        dst_pkts: 12,
        src_bytes: 500,
        dst_bytes: 800
    };

    try {
        console.log("Sending request to ML API...");
        const response = await axios.post('http://127.0.0.1:5000/predict', features, {
            timeout: 5000
        });
        console.log("Response from ML API:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error communicating with ML API:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
            console.error("Status:", error.response.status);
        }
    }
}

testMLService();
