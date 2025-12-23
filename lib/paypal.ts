import { Currency } from "lucide-react";

const base = 'https://api-m.sandbox.paypal.com'
export const paypal = {
    createOrder: async function createOrder(price: number) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/orders`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Conent-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: price,
                        }
                    }
                ]
            })
        })
        return handleResponse(response);
    },
    capturePayment: async function capturePayment(orderId: string) {
        const accessToken = await generateAccessToken();
        const url = `${base}/v2/checkout/order/${orderId}/capture`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`
            }
        });
        return handleResponse(response);
    }
}

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
    const jsonData = await handleResponse(response)
    return jsonData.access_token;
    /*
        if (response.ok) {
            const jsonData = await response.json();
            return jsonData.access_token;
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }
            */
}

async function handleResponse(response: Response) {
    if (response.ok) {
        return await response.json();
    } else {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

export { generateAccessToken }