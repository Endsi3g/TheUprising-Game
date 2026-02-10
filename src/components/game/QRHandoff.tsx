import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function QRHandoff() {
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUrl(window.location.href);
        }
    }, []);

    if (!url) return null;

    return (
        <div className="p-4 bg-white dark:bg-white rounded-xl shadow-lg inline-block">
            <QRCodeSVG value={url} size={128} />
            <p className="text-xs text-center mt-2 font-medium text-black">
                Scanner pour mobile
            </p>
        </div>
    );
}
