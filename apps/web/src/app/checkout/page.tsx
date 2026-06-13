"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Input, Toast, Loader } from "@/components/ui";
import { cartApi, orderApi, addressApi, Address } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";
import { Banknote, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n";

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accessToken, isAuthenticated, user } = useAuth();

  const [cart, setCart] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phonePrimary: "",
    country: "",
    city: "",
    area: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    paymentMethod: "COD",
    deliveryNotes: "",
  });

  const [cardData, setCardData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadCheckoutData();
  }, [isAuthenticated, accessToken]);

  const loadCheckoutData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [cartData, addresses] = await Promise.all([
        cartApi.getCart(accessToken),
        addressApi.getMyAddresses(accessToken),
      ]);
      setCart(cartData);
      setSavedAddresses(addresses || []);

      const defaultAddr = addresses?.find((a: any) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData((prev) => ({
          ...prev,
          fullName: defaultAddr.fullName,
          phonePrimary: defaultAddr.phonePrimary,
          country: defaultAddr.country,
          city: defaultAddr.city,
          area: defaultAddr.area,
          addressLine1: defaultAddr.addressLine1,
          addressLine2: defaultAddr.addressLine2 || "",
          postalCode: defaultAddr.postalCode || "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load checkout data");
    } finally {
      setIsLoading(false);
    }
  };

  const isCardValid = () => {
    if (formData.paymentMethod !== "VISA") return true;
    return (
      cardData.cardholderName.trim().length > 2 &&
      cardData.cardNumber.replace(/\s/g, "").length === 16 &&
      cardData.expiry.length === 5 &&
      cardData.cvv.length >= 3
    );
  };

  const handlePlaceOrder = async () => {
    if (!accessToken || !cart) return;
    if (!isCardValid()) {
      setError("Please fill in all card details correctly.");
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        phonePrimary: formData.phonePrimary,
        country: formData.country,
        city: formData.city,
        area: formData.area,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        postalCode: formData.postalCode,
        deliveryNotes: formData.deliveryNotes,
        paymentMethod: formData.paymentMethod,
      };

      const order = await orderApi.checkout(accessToken, orderData);
      setSuccess(t("checkout.orderSuccess"));
      await cartApi.getCart(accessToken);
      setTimeout(() => {
        router.push(`/order-confirmation/${order.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader label={t("checkout.loadingCheckout")} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("checkout.cartEmpty")}</h2>
              <p className="text-gray-600 mb-4">{t("checkout.cartEmptyDesc")}</p>
              <Button onClick={() => router.push("/products")}>{t("checkout.continueShopping")}</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + item.variant.priceCents * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.17);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col">
      <Header />

      <main className="flex-1">
        <div style={{ background: "#0F1F3D" }} className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Step 2 of 2</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white">{t("checkout.title")}</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
          {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Shipping address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black text-[#0F1F3D] mb-5">{t("checkout.shippingAddress")}</h2>
                <div className="space-y-4">
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">{t("checkout.savedAddresses")}</label>
                      <select
                        value={selectedAddressId}
                        onChange={(e) => {
                          const addr = savedAddresses.find((a) => a.id === e.target.value);
                          if (addr) {
                            setSelectedAddressId(addr.id);
                            setFormData((prev) => ({
                              ...prev,
                              fullName: addr.fullName,
                              phonePrimary: addr.phonePrimary,
                              country: addr.country,
                              city: addr.city,
                              area: addr.area,
                              addressLine1: addr.addressLine1,
                              addressLine2: addr.addressLine2 || "",
                              postalCode: addr.postalCode || "",
                            }));
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-sm"
                        style={{ "--tw-ring-color": "#FF5533" } as any}
                      >
                        <option value="">{t("checkout.selectAddress")}</option>
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.label || addr.fullName} — {addr.addressLine1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t("checkout.fields.fullName")} value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} />
                    <Input label={t("checkout.fields.email")} type="email" value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
                  </div>

                  <Input label={t("checkout.fields.phone")} value={formData.phonePrimary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phonePrimary: e.target.value }))} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t("checkout.fields.country")} value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))} />
                    <Input label={t("checkout.fields.city")} value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))} />
                  </div>

                  <Input label={t("checkout.fields.address1")} value={formData.addressLine1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, addressLine1: e.target.value }))} />
                  <Input label={t("checkout.fields.address2")} value={formData.addressLine2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, addressLine2: e.target.value }))} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label={t("checkout.fields.area")} value={formData.area}
                      onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))} />
                    <Input label={t("checkout.fields.postalCode")} value={formData.postalCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))} />
                  </div>

                  <Input label={t("checkout.fields.deliveryNotes")} value={formData.deliveryNotes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deliveryNotes: e.target.value }))}
                    placeholder={t("checkout.fields.deliveryNotesPlaceholder")} />
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-black text-[#0F1F3D] mb-5">{t("checkout.paymentMethod")}</h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      borderColor: formData.paymentMethod === "COD" ? "#FF5533" : "#E5E7EB",
                      background: formData.paymentMethod === "COD" ? "#FFF5F3" : "white",
                    }}
                  >
                    <input type="radio" name="payment" value="COD" className="sr-only"
                      checked={formData.paymentMethod === "COD"}
                      onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: "COD" }))} />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: formData.paymentMethod === "COD" ? "#FF5533" : "#F3F4F6" }}
                    >
                      <Banknote className="w-5 h-5" style={{ color: formData.paymentMethod === "COD" ? "white" : "#9CA3AF" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[#0F1F3D]">{t("checkout.cod")}</p>
                      <p className="text-sm text-gray-500">{t("checkout.codDesc")}</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: formData.paymentMethod === "COD" ? "#FF5533" : "#D1D5DB" }}
                    >
                      {formData.paymentMethod === "COD" && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5533" }} />
                      )}
                    </div>
                  </label>

                  {/* Visa Card */}
                  <label
                    className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      borderColor: formData.paymentMethod === "VISA" ? "#FF5533" : "#E5E7EB",
                      background: formData.paymentMethod === "VISA" ? "#FFF5F3" : "white",
                    }}
                  >
                    <input type="radio" name="payment" value="VISA" className="sr-only"
                      checked={formData.paymentMethod === "VISA"}
                      onChange={() => setFormData((prev) => ({ ...prev, paymentMethod: "VISA" }))} />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: formData.paymentMethod === "VISA" ? "#FF5533" : "#F3F4F6" }}
                    >
                      <CreditCard className="w-5 h-5" style={{ color: formData.paymentMethod === "VISA" ? "white" : "#9CA3AF" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#0F1F3D]">Credit / Debit Card</p>
                        <div className="flex gap-1">
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#1A1F71", color: "white" }}>VISA</span>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "#EB001B", color: "white" }}>MC</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: formData.paymentMethod === "VISA" ? "#FF5533" : "#D1D5DB" }}
                    >
                      {formData.paymentMethod === "VISA" && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5533" }} />
                      )}
                    </div>
                  </label>
                </div>

                {/* Card form */}
                {formData.paymentMethod === "VISA" && (
                  <div className="mt-5 p-5 rounded-xl border border-gray-100" style={{ background: "#F9FAFB" }}>
                    {/* Card preview */}
                    <div
                      className="relative rounded-2xl p-5 mb-5 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, #0F1F3D 0%, #1a3a6b 60%, #FF5533 140%)",
                        minHeight: 140,
                      }}
                    >
                      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: "white", transform: "translate(30%, -30%)" }} />
                      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10" style={{ background: "white", transform: "translate(-20%, 30%)" }} />
                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-7 rounded-sm" style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)" }} />
                          <span className="text-white font-black text-lg tracking-widest">VISA</span>
                        </div>
                        <p className="text-white font-mono text-base tracking-widest mb-3">
                          {cardData.cardNumber
                            ? cardData.cardNumber.padEnd(19, " ").replace(/(.{5})/g, (m, p) => p.slice(0, 4) + " ").trim().replace(/\d(?=.{5})/g, "•")
                            : "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Cardholder</p>
                            <p className="text-white font-bold text-sm uppercase tracking-wider">
                              {cardData.cardholderName || "YOUR NAME"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Expires</p>
                            <p className="text-white font-bold text-sm">{cardData.expiry || "MM/YY"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Name as on card"
                          value={cardData.cardholderName}
                          onChange={(e) => setCardData((prev) => ({ ...prev, cardholderName: e.target.value.toUpperCase() }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5533] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5533] bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={cardData.expiry}
                            onChange={(e) => setCardData((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5533] bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">CVV</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            placeholder="•••"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF5533] bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Your card details are encrypted and secure</span>
                      <ShieldCheck className="w-3.5 h-3.5 ml-auto" />
                      <span>SSL Protected</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — order summary */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h2 className="text-lg font-black text-[#0F1F3D] mb-4">{t("checkout.orderSummary")}</h2>

                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {(item.variant.images?.[0]?.url || item.variant.product?.images?.[0]?.url) ? (
                          <img
                            src={item.variant.images?.[0]?.url || item.variant.product.images[0].url}
                            alt={item.variant.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0F1F3D] truncate">{item.variant.product.title}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-[#0F1F3D] flex-shrink-0">
                        ₪{((item.variant.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{t("checkout.subtotal")}</span>
                    <span>₪{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t("checkout.tax")} (17%)</span>
                    <span>₪{(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t("checkout.shipping")}</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-base">
                    <span className="text-[#0F1F3D]">{t("checkout.total")}</span>
                    <span style={{ color: "#FF5533" }}>₪{(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!formData.fullName || !formData.addressLine1 || isSubmitting || !isCardValid()}
                  className="w-full mt-6 py-3.5 rounded-xl font-black text-white text-sm tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#FF5533" }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order…
                    </span>
                  ) : formData.paymentMethod === "VISA" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" /> Pay ₪{(total / 100).toFixed(2)}
                    </span>
                  ) : (
                    t("checkout.placeOrder")
                  )}
                </button>

                {formData.paymentMethod === "VISA" && (
                  <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Secured by SSL encryption
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
