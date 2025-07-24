import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function EmailOtpDialog({
    showOtpModal,
    setShowOtpModal,
    email,
    setEmail,
    name,
    password,
    confirmPassword,
    phone,
    role,
    setIsFlipped,
}) {
    const [otp, setOtp] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (otpSent && secondsLeft > 0) {
            const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [otpSent, secondsLeft]);

    const handleSendOtp = async () => {
        setIsSending(true);
        try {
            const res = await fetch("/api/verify/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                setSecondsLeft(60);
            } else {
                alert(data.error || "Failed to send OTP");
            }
        } catch (err) {
            console.error("OTP send error", err);
            alert("Something went wrong.");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        setIsVerifying(true);
        try {
            const verifyRes = await fetch("/api/verify/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                alert(verifyData.error || "Invalid OTP");
                return;
            }

            // OTP verified – Now register user
            const registerRes = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    role,
                    password,
                    confirmPassword,
                }),
            });

            const registerData = await registerRes.json();
            if (!registerRes.ok) {
                alert(registerData.error || "Registration failed.");
                return;
            }

            // Success
            toast("Registration successful!");
            setShowOtpModal(false);
            setIsFlipped(false); // flip to login form
        } catch (err) {
            console.error("Verify/Register error", err);
            toast("Something went wrong.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle>Email Verification</DialogTitle>
                </DialogHeader>

                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    placeholder="Enter email"
                />

                <div className="mt-3 flex gap-2">
                    <Button
                        className="bg-[#a80ba3] text-white w-full"
                        onClick={handleSendOtp}
                        disabled={isSending || otpSent}
                    >
                        {isSending ? "Sending..." : "Send OTP"}
                    </Button>
                </div>

                {otpSent && (
                    <>
                        <div className="mt-4">
                            <Input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                            />
                            {secondsLeft > 0 ? (
                                <p className="text-red-500 text-sm mt-1">
                                    OTP expires in {secondsLeft} second{secondsLeft !== 1 ? "s" : ""}
                                </p>
                            ) : (
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-red-600 text-sm">OTP expired.</p>
                                    <Button
                                        variant="link"
                                        className="text-blue-600 text-sm p-0 h-auto"
                                        onClick={handleSendOtp}
                                    >
                                        Resend OTP
                                    </Button>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-4">
                            <Button
                                className="bg-green-600 text-white w-full"
                                onClick={handleVerifyOtp}
                                disabled={otp.length !== 6 || isVerifying}
                            >
                                {isVerifying ? "Registering..." : "Verify & Register"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
