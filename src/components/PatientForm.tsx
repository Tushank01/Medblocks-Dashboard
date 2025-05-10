import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Patient, validatePatient, genderOptions } from "@/lib/schemas";
import { registerPatient } from "@/lib/db";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

interface PatientFormProps {
  onSuccess?: () => void;
}

const PatientForm = ({ onSuccess }: PatientFormProps) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    medical_history: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null); // Clear any errors when user makes changes
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError(null); // Clear any errors when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // ✅ Validate future date for DOB
    if (formData.date_of_birth) {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight

      if (selectedDate > today) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Date of birth cannot be in the future.",
        });
        return;
      }
    }

    // Validate the rest of the form
    const errors = validatePatient(formData);

    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting patient data:", formData);

      await registerPatient(formData);

      toast({
        title: "Success",
        description: "Patient registered successfully",
      });

      setFormData({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        medical_history: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error registering patient:", error);

      setFormError(
        "There was a problem registering the patient. Don't worry - your data has been safely stored and will be available."
      );

      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to register patient: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 👇 Today's date in YYYY-MM-DD format for input max attribute
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Registration Issue</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            required
            placeholder="John"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            required
            placeholder="Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth *</Label>
          <Input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            required
            max={todayStr} // ✅ Prevent selecting future dates
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleSelectChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="123 Main St, Anytown, ST 12345"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical_history">Medical History</Label>
        <Textarea
          id="medical_history"
          name="medical_history"
          value={formData.medical_history}
          onChange={handleInputChange}
          placeholder="Any relevant medical history, allergies, or conditions..."
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register Patient"}
        </Button>
      </div>
    </form>
  );
};

export default PatientForm;
