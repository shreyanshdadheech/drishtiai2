import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/components/ui/alert';
import { getStoredPath } from '@/helpers/path_helpers';
import { calculateAge } from '@/helpers/file_helpers';
import { Patient, Record, MediaFile } from '@/types/database';
import { ChevronLeft, X } from 'lucide-react';
import { cn } from "../utils/tailwind"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { getNewAccessToken } from '@/utils/auth-helpers';
import { getImagePath, joinUploadPath, getDatabasePaths } from '@/utils/path-helpers';

// Add interface for error response
interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

type ReportType = '1' | '2' | '3'; // 1: Glaucoma, 2: DR_DME, 3: CKD_CVD
type GenderType = '1' | '2'; // 1: Male, 2: Female

export default function PatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportType>('2'); // Default to DR_DME (2)
  const [selectedImages, setSelectedImages] = useState<MediaFile[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [imageQualities, setImageQualities] = useState<Record<string, QualityCheck>>({});
  const [fullName, setFullName] = useState<string>('');
  const [pid, setPid] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [dbStatus, setDbStatus] = useState<string>('1');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [dbType, setDbType] = useState<string>("1");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('');
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [genderValue, setGenderValue] = useState<GenderType>('2'); // Will be set based on patient data
  const [checkedImages, setCheckedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const serverPath = getStoredPath();
      
      if (!serverPath || !id) {
        setError('Invalid configuration');
        return;
      }

      const dbPaths = getDatabasePaths();

      // Load patient data
      const { data: patientData, error: patientError } = await window.electron.readJsonFile(dbPaths.patient);
      
      if (patientError) throw new Error(patientError);
      
      const foundPatient = (patientData as Patient[]).find(p => p._id === id);
      if (!foundPatient) throw new Error('Patient not found');
      
      setPatient(foundPatient);
      setFullName(`${foundPatient.firstname} ${foundPatient.lastname}`);
      setPid(foundPatient.pid);
      setGender(foundPatient.sex);
      setAge(calculateAge(foundPatient.birthday));
      setGenderValue(foundPatient.sex === 'Male' ? '1' : '2');

      // Load records
      const { data: recordData, error: recordError } = await window.electron.readJsonFile(dbPaths.record);
      
      if (recordError) throw new Error(recordError);
      
      const patientRecords = (recordData as Record[]).filter(
        record => record.patientid === id
      );
      setRecords(patientRecords);

      // Load media files
      const { data: mediaData, error: mediaError } = await window.electron.readJsonFile(dbPaths.mediafile);
      
      if (mediaError) throw new Error(mediaError);
      setMediaFiles(mediaData as MediaFile[]);

    } catch (err) {
      setError(`Error loading data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPatientImages = () => {
    if (!records || !mediaFiles) return [];
    
    const images = new Set<MediaFile>();
    records.forEach(record => {
      if (record.content && Array.isArray(record.content.photos)) {
        record.content.photos.forEach(photo => {
          const mediaFile = mediaFiles.find(mf => mf.filename === photo.filename);
          if (mediaFile) {
            images.add(mediaFile);
          }
        });
      }
    });
    
    return Array.from(images);
  };

  const checkImageQuality = async (filename: string): Promise<QualityCheck> => {
    try {
      const imagePath = joinUploadPath(`${filename}_th.jpg`);
      
      const { data: imageBuffer, error: readError } = await window.electron.readBinaryFile(imagePath);
      
      if (readError) {
        throw new Error(`Failed to read image file: ${readError}`);
      }
  
      const generateUniqueId = () => `tests_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      const imageFile = new File([blob], `${filename}_th.jpg`, { type: 'image/jpeg' });
      
      // Create FormData instance here
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const uniqueId = generateUniqueId();  
  
      const response = await fetch(`http://3.7.242.24:8006/quality_check?unique_id=${uniqueId}`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Failed to check image quality');
  
      const qualityData: QualityCheck = await response.json();
      
      // Add image to checked images set
      setCheckedImages(prev => new Set(prev).add(filename));
      
      setImageQualities(prev => ({
        ...prev,
        [filename]: qualityData
      }));
  
      return qualityData;
    } catch (error) {
      console.error('Error checking image quality:', error);
      throw error;
    }
  };

  const getQualityColor = (filename: string) => {
    const quality = imageQualities[filename];
    if (!quality || typeof quality.model_coef === "undefined") return "bg-white"; // Default to white

    switch (quality.model_coef.toString()) {
      case "0": return "bg-green-100"; // Good
      case "1": return "bg-yellow-100"; // Acceptable
      case "2": return "bg-red-100"; // Poor
      default: return "bg-white"; // Default
    }
  };

  const handleImageSelect = async (image: MediaFile) => {
    const imageType = image.originalname.substring(0, 2).toUpperCase();
    
    const isSelected = selectedImages.some(img => img.filename === image.filename);
    
    if (isSelected) {
      setSelectedImages(prev => prev.filter(img => img.filename !== image.filename));
      // Remove from checked images when deselected
      setCheckedImages(prev => {
        const next = new Set(prev);
        next.delete(image.filename);
        return next;
      });
      setAlertMessage(null);
      setAnalysis('');
      return;
    }
  
    if (imageType !== 'OD' && imageType !== 'OS') {
      setAlertMessage('Invalid image type. Image must start with OD or OS.');
      return;
    }
  
    const hasOD = selectedImages.some(img => img.originalname.substring(0, 2).toUpperCase() === 'OD');
    const hasOS = selectedImages.some(img => img.originalname.substring(0, 2).toUpperCase() === 'OS');
  
    if (imageType === 'OD' && hasOD) {
      setAlertMessage('You can only select one OD image.');
      return;
    }
  
    if (imageType === 'OS' && hasOS) {
      setAlertMessage('You can only select one OS image.');
      return;
    }
  
    setSelectedImages(prev => [...prev, image]);
    setAlertMessage(null);
  
    try {
      setAnalysis('Checking image quality...'); 
      const qualityData = await checkImageQuality(image.filename);
      
      if (!qualityData || !qualityData.model_response) {
        throw new Error('Quality check failed');
      }
      
      let analysisText = `Image Quality: ${qualityData.model_response}\n`;
      
      switch (qualityData.model_coef?.toString()) {
        case "0":
          analysisText += "Good image quality, no issues.";
          break;
        case "1":
          analysisText += "Acceptable image quality, but could be improved.";
          break;
        case "2":
          analysisText += "Poor image quality. Please retake the image.";
          break;
        default:
          analysisText += "Image quality assessment unavailable.";
      }
      
      setAnalysis(analysisText);
    } catch (error) {
      console.error('Error during image analysis:', error);
      setAnalysis('Please check your network for firewall or change the network');
      setSelectedImages(prev => prev.filter(img => img.filename !== image.filename));
    }
  };

  // Add helper function to check if any image is rejected
  const hasRejectedImages = () => {
    return selectedImages.some(img => {
      const quality = imageQualities[img.filename]?.model_coef;
      return quality === 2; // 2 represents poor/rejected quality
    });
  };

  const handleSubmit = async () => {
    if (selectedImages.length === 0) {
      setAlertMessage('Please select at least one image.');
      return;
    }

    if (hasRejectedImages()) {
      setAlertMessage('Cannot submit with rejected images. Please replace poor quality images.');
      return;
    }

    setShowSubmitDialog(true);
    setSubmitStatus('Preparing submission...');
    setSubmitProgress(10);
    setSubmitError(null);

    let formData: FormData | null = null;

    try {
      // Get fresh access token
      const accessToken = await getNewAccessToken();
      setSubmitProgress(20);

      formData = new FormData();
      formData.append('mrn', pid);
      formData.append('name', fullName);
      formData.append('age', age);
      formData.append('dbStatus', dbStatus);
      formData.append('reportType', selectedReport); // Now using correct numeric values
      formData.append('gender', genderValue); // Now using correct numeric values
      formData.append('dbType', dbType);

      // Log form data before image handling
      console.log('Submission Data:', {
        mrn: pid,
        name: fullName,
        age,
        dbStatus,
        reportType: selectedReport,
        gender: genderValue,
        dbType,
        accessToken: `${accessToken.substring(0, 10)}...`, // Only log part of token for security
      });

      setSubmitProgress(30);

      // Handle image uploads
      const odImage = selectedImages.find(img => img.originalname.toUpperCase().startsWith('OD'));
      const osImage = selectedImages.find(img => img.originalname.toUpperCase().startsWith('OS'));

      console.log('Selected Images:', {
        hasOD: !!odImage,
        hasOS: !!osImage,
        odFilename: odImage?.filename,
        osFilename: osImage?.filename,
        odQuality: odImage ? imageQualities[odImage.filename]?.model_coef : 'none',
        osQuality: osImage ? imageQualities[osImage.filename]?.model_coef : 'none',
      });

      if (odImage) {
        const odQuality = imageQualities[odImage.filename]?.model_coef || '';
        const imagePath = joinUploadPath(`${odImage.filename}_th.jpg`);
        
        const { data: imageBuffer } = await window.electron.readBinaryFile(imagePath);
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const file = new File([blob], `${odImage.filename}_th.jpg`, { type: 'image/jpeg' });
        
        formData.append('odRE', file);
        formData.append('rightQuality', odQuality);
        
        console.log('OD Image added:', {
          filename: `${odImage.filename}_th.jpg`,
          size: file.size,
          type: file.type,
          quality: odQuality
        });
      }

      setSubmitProgress(60);

      if (osImage) {
        const osQuality = imageQualities[osImage.filename]?.model_coef || '';
        const imagePath = joinUploadPath(`${osImage.filename}_th.jpg`);
        
        const { data: imageBuffer } = await window.electron.readBinaryFile(imagePath);
        const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
        const file = new File([blob], `${osImage.filename}_th.jpg`, { type: 'image/jpeg' });
        
        formData.append('osLE', file);
        formData.append('leftQuality', osQuality);
        
        console.log('OS Image added:', {
          filename: `${osImage.filename}_th.jpg`,
          size: file.size,
          type: file.type,
          quality: osQuality
        });
      }

      // Log final form data entries
      console.log('Final FormData entries:', 
        Array.from(formData.entries()).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value instanceof Blob ? `Blob (${value.size} bytes)` : value
        }), {})
      );

      setSubmitProgress(80);
      setSubmitStatus('Submitting report...');

      const response = await fetch('https://bioscanai.com/drishti/api/generateReport/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      // Log the full response for debugging
      console.log('Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Check if response is 502
      if (response.status === 502) {
        throw new Error('Server is temporarily unavailable. Please try again in a few minutes.');
      }

      // Check response content type
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();

      // Try to parse as JSON if it looks like JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Response parsing error:', {
          contentType,
          text: responseText.substring(0, 500)
        });
        throw new Error('Server returned invalid response format. Please try again later.');
      }

      if (!response.ok) {
        let errorMessage = 'Failed to generate report';
        
        if (responseData) {
          if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.errors) {
            errorMessage = Object.entries(responseData.errors)
              .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
              .join('\n');
          }
        }
        
        throw new Error(errorMessage);
      }

      setSubmitProgress(100);
      setSubmitStatus('Success!');
      setSubmitMessage(responseData.message);
      console.log('Submission Response:', responseData);
      
      setTimeout(() => {
        setShowSubmitDialog(false);
        setSubmitStatus('');
        setSubmitProgress(0);
        setSubmitMessage('');
      }, 3000);

    } catch (error) {
      console.error('Submission Error:', {
        error,
        requestData: {
          mrn: pid,
          name: fullName,
          age,
          dbStatus,
          reportType: selectedReport,
          gender: genderValue,
          dbType,
          images: selectedImages.map(img => ({
            name: img.originalname,
            type: img.originalname.substring(0, 2),
            quality: imageQualities[img.filename]?.model_coef
          }))
        }
      });

      let errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      
      if (error instanceof Error) {
        if (error.message.includes('No refresh token available')) {
          errorMessage = 'Your session has expired. Please login again.';
          setTimeout(() => navigate('/'), 2000);
        } else if (error.message.includes('Bad Gateway')) {
          errorMessage = 'Server is temporarily unavailable. Please try again in a few minutes.';
        }
      }

      setSubmitError(errorMessage);
      setSubmitStatus('Error occurred');
      setSubmitProgress(0);
    }
  };

  const getImageBlob = async (filename: string): Promise<Blob> => {
    const serverPath = getStoredPath();
    const { data } = await window.electron.readBinaryFile(
      `${serverPath}/uploads/${filename}`
    );
    return new Blob([data], { type: 'image/jpeg' });
  };

  // Add this helper function to check if all selected images have been quality checked
  const areAllImagesChecked = () => {
    return selectedImages.every(img => checkedImages.has(img.filename));
  };

  // ... existing loading and error states ...

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/home')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Patient Details</h1>
      </div>

      <div className="grid grid-cols-[300px_1fr_300px] gap-6 flex-1">
        {/* Left Column - Patient Details Table */}
        <div className="border rounded-lg p-4">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Full Name</TableCell>
                <TableCell>{fullName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Patient ID</TableCell>
                <TableCell>{pid}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gender</TableCell>
                <TableCell>{gender}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Age</TableCell>
                <TableCell>{age}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Diabetes Status</TableCell>
                <TableCell>
                  <RadioGroup
                    value={dbStatus}
                    onValueChange={(value) => setDbStatus(value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="db_yes" />
                      <Label htmlFor="db_yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="db_no" />
                      <Label htmlFor="db_no">No</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Diabetes Type</TableCell>
                <TableCell>
                  <RadioGroup
                    value={dbType}
                    onValueChange={(value) => setDbType(value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="type1" />
                      <Label htmlFor="type1">Type 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="type2" />
                      <Label htmlFor="type2">Type 2</Label>
                    </div>
                  </RadioGroup>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Middle Column */}
        <div className="flex flex-col gap-4">
          <RadioGroup
            value={selectedReport}
            onValueChange={(value) => setSelectedReport(value as ReportType)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="dr_dme" />
              <Label htmlFor="dr_dme">DR DME</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="glaucoma" />
              <Label htmlFor="glaucoma">Glaucoma Report</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="ckd_cvd" disabled />
              <Label htmlFor="ckd_cvd" className="text-muted-foreground">
                CKD, CVD (Coming Soon)
              </Label>
            </div>
          </RadioGroup>

          {/* Image View */}
          <div className="flex gap-4 h-[400px]">
            {selectedImages.map((image, index) => (
              <Card key={index} className="flex-1 p-4 rounded-lg border relative">
                <img
                  src={getImagePath(`${image.filename}_th.jpg`)}
                  alt={`Selected scan ${index + 1}`}
                  className="h-full w-full object-contain rounded-lg"
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.filename}`);
                    e.currentTarget.src = 'placeholder-image-url';
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageSelect(image);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
            {selectedImages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select images from the right panel
              </div>
            )}
          </div>

          {analysis && (
            <Alert variant="default" className="mt-4">
              {analysis}
            </Alert>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Select Images</h3>
          
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 grid grid-cols-2 gap-2">
              {getPatientImages().map((image) => (
                <Card
                  key={image._id}
                  className={cn(
                    "cursor-pointer p-2 rounded-lg border transition-all",
                    selectedImages.some(img => img.filename === image.filename) 
                      ? 'ring-2 ring-primary' 
                      : 'hover:bg-muted/50',
                    getQualityColor(image.filename)
                  )}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="relative pt-[100%]">
                    <img
                      src={getImagePath(`${image.filename}_th.jpg`)}
                      alt={image.originalname}
                      className="absolute inset-0 w-full h-full object-contain p-2"
                      onError={(e) => {
                        console.error(`Failed to load thumbnail: ${image.filename}`);
                        e.currentTarget.src = 'placeholder-image-url';
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {image.originalname}
                  </div>
                </Card>
              ))}
              {getPatientImages().length === 0 && (
                <div className="col-span-2 h-24 flex items-center justify-center text-muted-foreground">
                  No images available
                </div>
              )}
            </div>
          </ScrollArea>

          {alertMessage && (
            <Alert variant="destructive" className="mb-4">
              {alertMessage}
            </Alert>
          )}

          <div className="flex justify-between gap-4">
            <Button 
              className="flex-1" 
              disabled={!selectedImages.length || !selectedReport || !areAllImagesChecked() || hasRejectedImages()}
              onClick={handleSubmit}
            >
              {!selectedImages.length 
                ? "Select Images" 
                : !areAllImagesChecked()
                ? "Checking Image Quality..."
                : hasRejectedImages()
                ? "Poor Quality Images Detected"
                : "Submit for Analysis"}
            </Button>
            <Button 
              variant="outline"
              disabled
              className="flex-1"
            >
              Montage
            </Button>
          </div>
        </div>
      </div>

      {/* Add the submission dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{submitError ? 'Error' : 'Generating Report'}</AlertDialogTitle>
            <AlertDialogDescription>
              {submitStatus}
              {submitProgress > 0 && !submitError && (
                <Progress value={submitProgress} className="mt-2" />
              )}
              {submitMessage && (
                <div className="mt-4 text-green-600 font-medium">
                  {submitMessage}
                </div>
              )}
              {submitError && (
                <div className="mt-4 text-red-500 text-sm whitespace-pre-line">
                  {submitError}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {submitError ? (
              <>
                <AlertDialogCancel onClick={() => setShowSubmitDialog(false)}>Close</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleSubmit()}>Retry</AlertDialogAction>
              </>
            ) : submitMessage ? (
              <AlertDialogAction onClick={() => setShowSubmitDialog(false)}>Close</AlertDialogAction>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}