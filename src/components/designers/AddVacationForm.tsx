/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/designers/AddVacationForm.tsx - ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { Button, Input, FormControl, FormLabel, Alert } from '@mui/joy';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon, Alert01Icon } from '@hugeicons/core-free-icons';

interface Vacation {
  id: number
  userId: string
  startDate: string
  endDate: string
}

interface AddVacationFormProps {
  onAdd: (startDate: string, endDate: string) => void;
  loading?: boolean;
  existingVacations?: Vacation[];
  userId: string;
}

interface ConflictInfo {
  hasConflict: boolean;
  conflictingVacations: Array<{
    id: number;
    startDate: string;
    endDate: string;
    durationDays: number;
  }>;
  conflictType: 'overlap' | 'adjacent' | 'none';
}

export const AddVacationForm: React.FC<AddVacationFormProps> = ({
  onAdd,
  loading = false,
  existingVacations = [],
  userId
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo>({
    hasConflict: false,
    conflictingVacations: [],
    conflictType: 'none'
  });

  // ✅ Function to check for vacation conflicts
  const checkConflicts = (start: string, end: string): ConflictInfo => {
    if (!start || !end) {
      return { hasConflict: false, conflictingVacations: [], conflictType: 'none' };
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    
    if (startDateObj >= endDateObj) {
      return { hasConflict: false, conflictingVacations: [], conflictType: 'none' };
    }

    const conflictingVacations: Array<{
      id: number;
      startDate: string;
      endDate: string;
      durationDays: number;
    }> = [];

    let conflictType: 'overlap' | 'adjacent' | 'none' = 'none';

    for (const vacation of existingVacations) {
      const vacStart = new Date(vacation.startDate);
      const vacEnd = new Date(vacation.endDate);
      
      // Check for overlap
      const hasOverlap = startDateObj <= vacEnd && endDateObj >= vacStart;
      
      // Check for adjacency (within 1 day)
      const dayBefore = new Date(vacStart);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayAfter = new Date(vacEnd);
      dayAfter.setDate(dayAfter.getDate() + 1);
      
      const isAdjacent = (
        startDateObj.getTime() === dayAfter.getTime() ||
        endDateObj.getTime() === dayBefore.getTime()
      );

      if (hasOverlap || isAdjacent) {
        const durationDays = Math.ceil(
          (vacEnd.getTime() - vacStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        conflictingVacations.push({
          id: vacation.id,
          startDate: vacation.startDate,
          endDate: vacation.endDate,
          durationDays
        });

        if (hasOverlap) {
          conflictType = 'overlap';
        } else if (isAdjacent && conflictType === 'none') {
          conflictType = 'adjacent';
        }
      }
    }

    return {
      hasConflict: conflictingVacations.length > 0,
      conflictingVacations,
      conflictType
    };
  };

  // ✅ Check conflicts whenever dates change
  useEffect(() => {
    const conflicts = checkConflicts(startDate, endDate);
    setConflictInfo(conflicts);
  }, [startDate, endDate, existingVacations]);

  // ✅ Enhanced validation
  const isFormValid = () => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) return false;
    
    // Allow form submission even with conflicts (user can decide)
    return true;
  };

  // ✅ Get today's date for min attribute
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleAdd = () => {
    if (isFormValid()) {
      // If there are conflicts, user is warned but can still proceed
      onAdd(startDate, endDate);
      setStartDate('');
      setEndDate('');
      setConflictInfo({ hasConflict: false, conflictingVacations: [], conflictType: 'none' });
    }
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    
    // Auto-adjust end date if it's before start date
    if (endDate && newStartDate && new Date(newStartDate) >= new Date(endDate)) {
      const nextDay = new Date(newStartDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            slotProps={{ input: { min: getTodayString() } }}
            size='sm'
          />
        </FormControl>
        
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>End Date</FormLabel>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            slotProps={{ input: { min: startDate || getTodayString() } }}
            size='sm'
          />
        </FormControl>
        
        <Button
          variant="solid"
          color="primary"
          startDecorator={<HugeiconsIcon icon={PlusSignIcon} size={16} />}
          onClick={handleAdd}
          disabled={!isFormValid() || loading}
          loading={loading}
          sx={{ mt: 'auto' }}
          size="sm"
        >
          Add Vacation
        </Button>
      </div>

      {/* ✅ Conflict warnings */}
      {conflictInfo.hasConflict && (
        <Alert
          color={conflictInfo.conflictType === 'overlap' ? 'danger' : 'warning'}
          variant="soft"
          startDecorator={<HugeiconsIcon icon={Alert01Icon} size={20} />}
        >
          <div>
            <div className="font-medium mb-2">
              {conflictInfo.conflictType === 'overlap' 
                ? '⚠️ Date Overlap Detected' 
                : '📅 Adjacent Vacation Detected'
              }
            </div>
            
            <div className="text-sm space-y-1">
              {conflictInfo.conflictType === 'overlap' && (
                <p>The selected dates overlap with existing vacation(s):</p>
              )}
              {conflictInfo.conflictType === 'adjacent' && (
                <p>The selected dates are adjacent to existing vacation(s). Consider merging:</p>
              )}
              
              <ul className="list-disc list-inside space-y-1 mt-2">
                {conflictInfo.conflictingVacations.map((vacation) => (
                  <li key={vacation.id}>
                    <strong>{formatDateForDisplay(vacation.startDate)}</strong> to{' '}
                    <strong>{formatDateForDisplay(vacation.endDate)}</strong>
                    {' '}({vacation.durationDays} days)
                  </li>
                ))}
              </ul>
              
              {conflictInfo.conflictType === 'overlap' && (
                <p className="mt-2 text-xs opacity-80">
                  Please adjust the dates to avoid overlap, or delete the conflicting vacation first.
                </p>
              )}
              {conflictInfo.conflictType === 'adjacent' && (
                <p className="mt-2 text-xs opacity-80">
                  You can still add this vacation, but consider if you want to merge them instead.
                </p>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* ✅ Validation message for invalid date range */}
      {startDate && endDate && new Date(startDate) >= new Date(endDate) && (
        <Alert color="danger" variant="soft" size="sm">
          End date must be after start date
        </Alert>
      )}

      {/* ✅ Duration preview */}
      {startDate && endDate && new Date(startDate) < new Date(endDate) && (
        <div className="text-sm text-gray-400">
          Duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
        </div>
      )}
    </div>
  );
};