import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

export default function QRHandoff() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const url = window.location.href;

    return (
        <div className="p-4 bg-white dark:bg-white rounded-xl shadow-lg inline-block">
            <QRCodeSVG value={url} size={128} />
            <p className="text-xs text-center mt-2 font-medium text-black">
                Scanner pour mobile
            </p>
        </div>
    );
}
