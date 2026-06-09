"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, Button, Input, Toast, Loader } from "@/components/ui";
import { cartApi, orderApi, addressApi, Address } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import ChatWidget from "@/components/ChatWidget";
import { useTranslation } from "react-i18next";
import "@/i18n";

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

  const handlePlaceOrder = async () => {
    if (!accessToken || !cart) return;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("checkout.title")}</h1>

          {error && <Toast type="error" message={error} onClose={() => setError(null)} />}
          {success && <Toast type="success" message={success} onClose={() => setSuccess(null)} />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card title={t("checkout.shippingAddress")}>
                <div className="space-y-4">
                  {savedAddresses.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("checkout.savedAddresses")}
                      </label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">{t("checkout.selectAddress")}</option>
                        {savedAddresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.label || addr.fullName} - {addr.addressLine1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t("checkout.fields.fullName")}
                      value={formData.fullName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    />
                    <Input
                      label={t("checkout.fields.email")}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <Input
                    label={t("checkout.fields.phone")}
                    value={formData.phonePrimary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phonePrimary: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t("checkout.fields.country")}
                      value={formData.country}
                      onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    />
                    <Input
                      label={t("checkout.fields.city")}
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    />
                  </div>

                  <Input
                    label={t("checkout.fields.address1")}
                    value={formData.addressLine1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, addressLine1: e.target.value }))}
                  />

                  <Input
                    label={t("checkout.fields.address2")}
                    value={formData.addressLine2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, addressLine2: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t("checkout.fields.area")}
                      value={formData.area}
                      onChange={(e) => setFormData((prev) => ({ ...prev, area: e.target.value }))}
                    />
                    <Input
                      label={t("checkout.fields.postalCode")}
                      value={formData.postalCode}
                      onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                    />
                  </div>

                  <Input
                    label={t("checkout.fields.deliveryNotes")}
                    value={formData.deliveryNotes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deliveryNotes: e.target.value }))}
                    placeholder={t("checkout.fields.deliveryNotesPlaceholder")}
                  />
                </div>
              </Card>

              <Card title={t("checkout.paymentMethod")} className="mt-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{t("checkout.cod")}</p>
                      <p className="text-sm text-gray-600">{t("checkout.codDesc")}</p>
                    </div>
                  </label>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card title={t("checkout.orderSummary")}>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.variant.product.title} x {item.quantity}</span>
                      <span className="font-medium">
                        ₪{((item.variant.priceCents * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("checkout.subtotal")}</span>
                    <span>₪{(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("checkout.tax")}</span>
                    <span>₪{(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("checkout.shipping")}</span>
                    <span>₪{(shipping / 100).toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-base">
                    <span>{t("checkout.total")}</span>
                    <span className="text-indigo-600">₪{(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  isLoading={isSubmitting}
                  disabled={!formData.fullName || !formData.addressLine1}
                  className="w-full mt-6"
                >
                  {t("checkout.placeOrder")}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
}
