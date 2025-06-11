
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Download, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';
import { supabaseDataService } from '@/services/supabaseDataService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportDataModalProps {
  children: React.ReactNode;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [dataType, setDataType] = useState<'farms' | 'crops' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (data: any, type: string) => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('AquaWise - Homa Bay County', 20, 20);
    doc.setFontSize(14);
    doc.text(`${type} Data Export`, 20, 30);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);

    let yPosition = 60;

    if (type === 'Farms' || type === 'All') {
      const farms = type === 'All' ? data.farms : data;
      if (farms && farms.length > 0) {
        doc.setFontSize(12);
        doc.text('Farms Data', 20, yPosition);
        yPosition += 10;

        const farmHeaders = ['Name', 'Location', 'Size (acres)', 'Soil Type'];
        const farmData = farms.map((farm: any) => [
          farm.name,
          farm.location,
          farm.size.toString(),
          farm.soil_type
        ]);

        (doc as any).autoTable({
          head: [farmHeaders],
          body: farmData,
          startY: yPosition,
          margin: { left: 20, right: 20 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }

    if (type === 'Crops' || type === 'All') {
      const crops = type === 'All' ? data.crops : data;
      if (crops && crops.length > 0) {
        doc.setFontSize(12);
        doc.text('Crops Data', 20, yPosition);
        yPosition += 10;

        const cropHeaders = ['Name', 'Area (acres)', 'Planted Date', 'Expected Harvest'];
        const cropData = crops.map((crop: any) => [
          crop.name,
          crop.area.toString(),
          crop.planted_date,
          crop.expected_harvest
        ]);

        (doc as any).autoTable({
          head: [cropHeaders],
          body: cropData,
          startY: yPosition,
          margin: { left: 20, right: 20 }
        });
      }
    }

    doc.save(`aquawise_${type.toLowerCase()}_data.pdf`);
  };

  const exportToExcel = async (data: any, type: string) => {
    // Create CSV content
    let csvContent = '';
    
    if (type === 'Farms' || type === 'All') {
      const farms = type === 'All' ? data.farms : data;
      if (farms && farms.length > 0) {
        csvContent += 'FARMS DATA\n';
        csvContent += 'Name,Location,Size (acres),Soil Type,Created Date\n';
        farms.forEach((farm: any) => {
          csvContent += `"${farm.name}","${farm.location}",${farm.size},"${farm.soil_type}","${new Date(farm.created_at).toLocaleDateString()}"\n`;
        });
        csvContent += '\n';
      }
    }

    if (type === 'Crops' || type === 'All') {
      const crops = type === 'All' ? data.crops : data;
      if (crops && crops.length > 0) {
        csvContent += 'CROPS DATA\n';
        csvContent += 'Name,Area (acres),Planted Date,Expected Harvest,Water Requirement\n';
        crops.forEach((crop: any) => {
          csvContent += `"${crop.name}",${crop.area},"${crop.planted_date}","${crop.expected_harvest}","${crop.water_requirement}"\n`;
        });
      }
    }

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aquawise_${type.toLowerCase()}_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let data: any = {};
      
      if (dataType === 'farms') {
        data = await supabaseDataService.getFarms();
      } else if (dataType === 'crops') {
        data = await supabaseDataService.getCrops();
      } else {
        const [farms, crops] = await Promise.all([
          supabaseDataService.getFarms(),
          supabaseDataService.getCrops()
        ]);
        data = { farms, crops };
      }

      const typeLabel = dataType === 'farms' ? 'Farms' : dataType === 'crops' ? 'Crops' : 'All';

      if (format === 'pdf') {
        await exportToPDF(data, typeLabel);
      } else {
        await exportToExcel(data, typeLabel);
      }

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data Type</label>
            <Select value={dataType} onValueChange={(value: 'farms' | 'crops' | 'all') => setDataType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="farms">Farms Only</SelectItem>
                <SelectItem value="crops">Crops Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={format} onValueChange={(value: 'pdf' | 'excel') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Excel/CSV
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="flex-1">
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataModal;
