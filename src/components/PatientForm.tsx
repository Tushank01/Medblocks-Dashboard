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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Today's date in YYYY-MM-DD format for input max attribute
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Patient Registration</CardTitle>
              <CardDescription className="text-blue-100 mt-1">
                Enter patient details to add them to the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {formError && (
          <Alert variant="destructive" className="mx-6 mt-6">
            <AlertTitle>Registration Issue</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 pt-8">
            <div className="mb-6 text-right">
              <span className="text-sm text-muted-foreground">* Required fields</span>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-blue-800 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="font-medium text-sm">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      placeholder="John"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="font-medium text-sm">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth" className="font-medium text-sm">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                      max={todayStr}
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="font-medium text-sm">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger className="h-11 border-slate-200 focus-visible:ring-blue-500">
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
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-blue-800 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-sm">
                      Email
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4 ml-1 inline-block text-slate-400" 
                              viewBox="0 0 20 20" 
                              fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">For sending appointment reminders and medical reports</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium text-sm">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="font-medium text-sm">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, Anytown, ST 12345"
                      className="h-11 border-slate-200 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-blue-800 border-b pb-2">Medical Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="medical_history" className="font-medium text-sm">
                    Medical History
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 ml-1 inline-block text-slate-400" 
                            viewBox="0 0 20 20" 
                            fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">Include allergies, chronic conditions, past surgeries, or current medications</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Textarea
                    id="medical_history"
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    placeholder="Any relevant medical history, allergies, or conditions..."
                    rows={4}
                    className="resize-none border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t bg-slate-50 p-6 rounded-b-lg">
            <Button 
              type="submit" 
              disabled={loading}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  Register Patient
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default PatientForm;