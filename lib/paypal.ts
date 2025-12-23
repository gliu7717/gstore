const base = 'https://api-m.sandbox.paypal.com'
export const paypal = {}

//generate access token
async function generateAccessToken() {
    const { PAYPAL_CLIENT_ID, PAYPAL_API_SECRET } = process.env;
    console.log(PAYPAL_API_SECRET);
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_API_SECRET}`).toString(
        'base64'
    );

    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (response.ok) {
        const jsonData = await response.json();
        return jsonData.access_token;
    } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}


export { generateAccessToken }