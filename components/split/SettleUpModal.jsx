"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  HandCoins,
  ChevronRight,
  IndianRupee,
  Loader2,
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", icon: Smartphone },
  { id: "cash", name: "Cash", icon: Banknote },
  { id: "bank_transfer", name: "Bank Transfer", icon: CreditCard },
  { id: "wallet", name: "Wallet", icon: Wallet },
];

export default function SettleUpModal({
  isOpen,
  onClose,
  group,
  simplifiedDebts,
  onSettlementRecorded,
}) {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select"); // 'select' | 'details' | 'success'

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?"
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDebtSelect = (debt) => {
    setSelectedDebt(debt);
    setAmount(debt.amount.toString());
    setStep("details");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDebt || !amount) {
      toast.error("Please enter an amount");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/split/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group._id,
          to: selectedDebt.to._id,
          amount: parseFloat(amount),
          paymentMethod,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep("success");
        setTimeout(() => {
          onSettlementRecorded?.(data.settlement);
          resetForm();
        }, 2000);
      } else {
        toast.error(data.error || "Failed to record settlement");
      }
    } catch (error) {
      console.error("Error recording settlement:", error);
      toast.error("Failed to record settlement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDebt(null);
    setAmount("");
    setPaymentMethod("upi");
    setNotes("");
    setStep("select");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Settle Up
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select who to pay */}
        {step === "select" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a payment to settle:
            </p>

            {simplifiedDebts?.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">All Settled!</h3>
                <p className="text-muted-foreground">
                  There are no pending balances in this group.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {simplifiedDebts?.map((debt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDebtSelect(debt)}
                    className="w-full flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={debt.from?.avatar} />
                        <AvatarFallback>
                          {getInitials(debt.from?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{debt.from?.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>pays</span>
                          <ChevronRight className="h-3 w-3 mx-1" />
                          <span>{debt.to?.name}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(debt.amount)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Payment details */}
        {step === "details" && selectedDebt && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <Avatar className="mx-auto mb-1">
                    <AvatarImage src={selectedDebt.from?.avatar} />
                    <AvatarFallback>
                      {getInitials(selectedDebt.from?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">
                    {selectedDebt.from?.name}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <Avatar className="mx-auto mb-1">
                    <AvatarImage src={selectedDebt.to?.avatar} />
                    <AvatarFallback>
                      {getInitials(selectedDebt.to?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium">{selectedDebt.to?.name}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 text-lg"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Full amount: {formatCurrency(selectedDebt.amount)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-2 gap-2"
              >
                {PAYMENT_METHODS.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={method.id} className="sr-only" />
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">{method.name}</span>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Paid via Google Pay"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("select")}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Recorded!</h3>
            <p className="text-muted-foreground">
              Waiting for {selectedDebt?.to?.name} to confirm the payment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
