"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Lock,
  ShieldCheck,
  Tag,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalTotal: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);

  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState<boolean>(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-rose-500 border-t-transparent mb-4" />
        <p className="text-slate-500 font-medium">Securing your checkout...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="text-slate-500 text-sm">Please add items to your basket before checking out.</p>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm shadow-md hover:bg-rose-700"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart?.subtotal || 0;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = appliedCoupon ? appliedCoupon.finalTotal : subtotal;

  // Handle coupon validation
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await api.post<{
        valid: boolean;
        message: string;
        code: string;
        discountAmount: number;
        finalTotal: number;
      }>("/coupons/validate", {
        code: couponInput.trim(),
        subtotal,
      });

      if (res.success && res.data?.valid) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          finalTotal: res.data.finalTotal,
        });
        setCouponSuccess(res.data.message);
      } else {
        setCouponError(res.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  // Handle Razorpay Payment flow
  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setErrorMessage(null);

      // Step 1: Create Order in DB
      const orderRes = await api.post<{ orderNumber: string }>("/orders", {
        couponCode: appliedCoupon?.code,
      });

      if (!orderRes.success || !orderRes.data?.orderNumber) {
        throw new Error(orderRes.message || "Failed to initiate order");
      }

      const orderNumber = orderRes.data.orderNumber;

      // Step 2: Create Razorpay Order
      const rzpRes = await api.post<{
        razorpayOrderId: string;
        amount: number;
        currency: string;
        keyId: string;
        orderNumber: string;
      }>("/payments/create-order", { orderNumber });

      if (!rzpRes.success || !rzpRes.data?.razorpayOrderId) {
        throw new Error(rzpRes.message || "Failed to initialize payment gateway");
      }

      const rzpData = rzpRes.data;

      // Check if real Razorpay modal is available or test simulation
      const hasLiveRazorpay =
        typeof window !== "undefined" &&
        window.Razorpay &&
        !rzpData.keyId.includes("placeholder");

      if (hasLiveRazorpay) {
        const options = {
          key: rzpData.keyId,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "Kalyan Kids Clothing",
          description: `Order #${orderNumber}`,
          order_id: rzpData.razorpayOrderId,
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: "#e11d48", // Rose primary theme
          },
          handler: async function (response: any) {
            try {
              // Step 3: Verify Payment Signature
              const verifyRes = await api.post("/payments/verify", {
                orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                await refreshCart();
                router.push(`/order-success/${orderNumber}`);
              } else {
                setErrorMessage(verifyRes.message || "Payment verification failed");
              }
            } catch (err: any) {
              setErrorMessage(err.message || "Verification failed");
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentLoading(false);
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      } else {
        // Test Simulation Mode (Direct Verification with simulated signature)
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        const simulatedSignature = `test_sig_${Date.now()}`;

        const verifyRes = await api.post("/payments/verify", {
          orderNumber,
          razorpayOrderId: rzpData.razorpayOrderId,
          razorpayPaymentId: simulatedPaymentId,
          razorpaySignature: simulatedSignature,
        });

        if (verifyRes.success) {
          await refreshCart();
          router.push(`/order-success/${orderNumber}`);
        } else {
          setErrorMessage(verifyRes.message || "Payment verification failed");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during checkout");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayScriptLoaded(true)}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 mb-2">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Complete Your Order
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your clothing items and complete payment securely via Razorpay.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Cart Items Review */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-slate-900 text-base">
                Order Items ({items.length})
              </h2>
              <Link
                href="/cart"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Edit Cart
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const img = item.product.image || "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=300";
                return (
                  <div key={item.id} className="py-3.5 flex items-center gap-4">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {item.product.brand || "Kalyan Kids"}
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {item.product.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.variant.size} • {item.variant.color} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{item.totalPrice}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ₹{item.unitPrice} ea
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Coupon & Payment Summary */}
          <div className="md:col-span-5 space-y-4">
            {/* Coupon Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Promotional Coupon
              </label>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Coupon &apos;{appliedCoupon.code}&apos; Active
                    </div>
                    <div className="text-[11px] text-emerald-600">
                      You saved ₹{appliedCoupon.discountAmount}!
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}

              {couponError && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  {couponError}
                </div>
              )}
              {couponSuccess && !appliedCoupon && (
                <div className="mt-2 text-xs text-emerald-600 font-medium">
                  {couponSuccess}
                </div>
              )}
            </div>

            {/* Total Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Taxes (GST)</span>
                  <span className="font-semibold text-slate-900">Included</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <div className="text-base font-bold text-slate-900">Total Amount</div>
                  <div className="text-[11px] text-slate-400">Server validated price</div>
                </div>
                <div className="text-2xl font-black text-rose-600">
                  ₹{finalTotal}
                </div>
              </div>

              {/* Payment Button */}
              <button
                type="button"
                disabled={paymentLoading}
                onClick={handlePayment}
                className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-base shadow-lg shadow-rose-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                {paymentLoading ? "Processing Payment..." : `Pay ₹${finalTotal}`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Powered by Razorpay Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
