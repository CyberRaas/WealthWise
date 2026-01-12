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
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plane,
  Home,
  Heart,
  Calendar,
  Briefcase,
  MoreHorizontal,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const GROUP_TYPES = [
  { id: "trip", name: "Trip", icon: Plane, color: "bg-blue-500" },
  { id: "home", name: "Home", icon: Home, color: "bg-green-500" },
  { id: "couple", name: "Couple", icon: Heart, color: "bg-pink-500" },
  { id: "event", name: "Event", icon: Calendar, color: "bg-purple-500" },
  { id: "project", name: "Project", icon: Briefcase, color: "bg-orange-500" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "bg-gray-500" },
];

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("trip");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    const email = memberEmail.trim().toLowerCase();

    if (!email) return;

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (memberEmails.includes(email)) {
      toast.error("Email already added");
      return;
    }

    setMemberEmails((prev) => [...prev, email]);
    setMemberEmail("");
  };

  const handleRemoveMember = (email) => {
    setMemberEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/split/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          type,
          memberEmails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onGroupCreated?.(data.group);
        resetForm();
      } else {
        toast.error(data.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("trip");
    setMemberEmail("");
    setMemberEmails([]);
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
            <Users className="h-5 w-5" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Type Selection */}
          <div className="space-y-2">
            <Label>Group Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {GROUP_TYPES.map((groupType) => {
                const IconComponent = groupType.icon;
                return (
                  <button
                    key={groupType.id}
                    type="button"
                    onClick={() => setType(groupType.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      type === groupType.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 mx-auto rounded-full ${groupType.color} flex items-center justify-center mb-1`}
                    >
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs text-center font-medium">
                      {groupType.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Goa Trip 2025"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details about this group..."
              rows={2}
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="flex gap-2">
              <Input
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address"
                type="email"
              />
              <Button type="button" variant="outline" onClick={handleAddMember}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can also add members later
            </p>

            {/* Member List */}
            {memberEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {memberEmails.map((email) => (
                  <Badge
                    key={email}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
