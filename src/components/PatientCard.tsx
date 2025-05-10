
import { Patient, calculateAge, formatDate } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientCardProps {
  patient: Patient;
}

const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {patient.first_name} {patient.last_name}
        </CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            {calculateAge(patient.date_of_birth)} years old • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
          </span>
          <span className="text-xs">
            ID: {patient.id}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {patient.email && (
          <div className="flex items-start">
            <span className="font-medium min-w-[80px]">Email:</span>
            <span>{patient.email}</span>
          </div>
        )}
        
        {patient.phone && (
          <div className="flex items-start">
            <span className="font-medium min-w-[80px]">Phone:</span>
            <span>{patient.phone}</span>
          </div>
        )}
        
        {patient.address && (
          <div className="flex items-start">
            <span className="font-medium min-w-[80px]">Address:</span>
            <span>{patient.address}</span>
          </div>
        )}
        
        {patient.medical_history && (
          <div className="flex items-start">
            <span className="font-medium min-w-[80px]">History:</span>
            <span className="text-muted-foreground line-clamp-2">{patient.medical_history}</span>
          </div>
        )}
        
        {patient.created_at && (
          <div className="text-xs text-muted-foreground pt-2">
            Registered on: {formatDate(patient.created_at)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCard;
