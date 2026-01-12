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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Receipt,
  Equal,
  Percent,
  Calculator,
  IndianRupee,
  Loader2,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food & Drinks", emoji: "🍔" },
  { id: "transport", name: "Transport", emoji: "🚗" },
  { id: "accommodation", name: "Accommodation", emoji: "🏨" },
  { id: "shopping", name: "Shopping", emoji: "🛍️" },
  { id: "entertainment", name: "Entertainment", emoji: "🎬" },
  { id: "utilities", name: "Utilities", emoji: "💡" },
  { id: "groceries", name: "Groceries", emoji: "🛒" },
  { id: "general", name: "General", emoji: "📝" },
];

export default function AddExpenseModal({
  isOpen,
  onClose,
  group,
  onExpenseAdded,
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("general");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // For exact/percentage splits
  const [customSplits, setCustomSplits] = useState({});

  const members = group?.members?.filter((m) => m.user) || [];

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!paidBy) {
      toast.error("Please select who paid");
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        groupId: group._id,
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        paidBy,
        splitType,
        date,
        notes: notes.trim(),
      };

      // Add custom splits if not equal
      if (splitType !== "equal" && Object.keys(customSplits).length > 0) {
        expenseData.splits = Object.entries(customSplits).map(
          ([userId, value]) => ({
            user: userId,
            amount: splitType === "exact" ? parseFloat(value) : undefined,
            percentage:
              splitType === "percentage" ? parseFloat(value) : undefined,
          })
        );
      }

      const response = await fetch("/api/split/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();

      if (data.success) {
        onExpenseAdded?.(data.expense);
        resetForm();
      } else {
        toast.error(data.error || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setCategory("general");
    setPaidBy("");
    setSplitType("equal");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setCustomSplits({});
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSplitChange = (userId, value) => {
    setCustomSplits((prev) => ({
      ...prev,
      [userId]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label
                htmlFor="description"
                className="text-slate-700 dark:text-slate-300"
              >
                Description *
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Dinner at restaurant"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="pl-9"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="text-slate-700 dark:text-slate-300"
              >
                Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">
              Category
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    category === cat.id
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                      : "border-slate-300 dark:border-slate-600 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <p className="text-xs mt-1 truncate text-slate-900 dark:text-slate-100">
                    {cat.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">
              Paid by *
            </Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.user._id}
                  type="button"
                  onClick={() => setPaidBy(member.user._id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                    paidBy === member.user._id
                      ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                      : "border-slate-300 dark:border-slate-600 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">
                    {member.user.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">
              Split Type
            </Label>
            <RadioGroup
              value={splitType}
              onValueChange={setSplitType}
              className="grid grid-cols-3 gap-2"
            >
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  splitType === "equal"
                    ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                <RadioGroupItem value="equal" className="sr-only" />
                <Equal className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  Equal
                </span>
              </label>
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  splitType === "exact"
                    ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                <RadioGroupItem value="exact" className="sr-only" />
                <Calculator className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  Exact
                </span>
              </label>
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  splitType === "percentage"
                    ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                    : "border-slate-300 dark:border-slate-600"
                }`}
              >
                <RadioGroupItem value="percentage" className="sr-only" />
                <Percent className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  Percent
                </span>
              </label>
            </RadioGroup>

            {/* Custom split inputs */}
            {splitType !== "equal" && (
              <div className="mt-3 space-y-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {splitType === "exact"
                    ? "Enter amount for each member"
                    : "Enter percentage for each member"}
                </p>
                {members.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 text-slate-900 dark:text-slate-100">
                      {member.user.name}
                    </span>
                    <Input
                      type="number"
                      value={customSplits[member.user._id] || ""}
                      onChange={(e) =>
                        handleSplitChange(member.user._id, e.target.value)
                      }
                      placeholder="0"
                      className="w-20 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                      min="0"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {splitType === "exact" ? "₹" : "%"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-slate-700 dark:text-slate-300"
            >
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details..."
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
