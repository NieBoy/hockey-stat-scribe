
import React, { useState } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface OpponentGoalFormProps {
  onJerseyNumberChange: (type: 'scorer' | 'primaryAssist' | 'secondaryAssist', value: string) => void;
  onComplete: () => void;
  jerseyNumbers: {
    scorer: string;
    primaryAssist: string;
    secondaryAssist: string;
  };
}

type FormValues = {
  scorerJersey: string;
  hasAssists: string;
  primaryAssistJersey: string;
  secondaryAssistJersey: string;
};

export function OpponentGoalForm({ 
  onJerseyNumberChange, 
  onComplete, 
  jerseyNumbers 
}: OpponentGoalFormProps) {
  const [hasAssists, setHasAssists] = useState<string>("no");
  
  const form = useForm<FormValues>({
    defaultValues: {
      scorerJersey: jerseyNumbers.scorer || '',
      hasAssists: "no",
      primaryAssistJersey: '',
      secondaryAssistJersey: ''
    }
  });

  const handleAssistToggle = (value: string) => {
    setHasAssists(value);
    if (value === "no") {
      onJerseyNumberChange('primaryAssist', '');
      onJerseyNumberChange('secondaryAssist', '');
      form.setValue('primaryAssistJersey', '');
      form.setValue('secondaryAssistJersey', '');
    }
  };

  const handleSubmit = (values: FormValues) => {
    onJerseyNumberChange('scorer', values.scorerJersey);
    
    if (hasAssists === "yes") {
      onJerseyNumberChange('primaryAssist', values.primaryAssistJersey);
      onJerseyNumberChange('secondaryAssist', values.secondaryAssistJersey);
    }
    
    onComplete();
  };

  const handleScorerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onJerseyNumberChange('scorer', value);
  };

  const handlePrimaryAssistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onJerseyNumberChange('primaryAssist', value);
  };

  const handleSecondaryAssistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onJerseyNumberChange('secondaryAssist', value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Opponent Goal Information</h2>
      <p className="text-sm text-muted-foreground">
        Enter the jersey numbers of the opponent players involved in the goal
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="scorerJersey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scorer Jersey Number (optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter jersey number" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      handleScorerChange(e);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Were there assists?</FormLabel>
            <RadioGroup
              defaultValue="no"
              value={hasAssists}
              onValueChange={handleAssistToggle}
              className="flex flex-row gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="assists-yes" />
                <Label htmlFor="assists-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="assists-no" />
                <Label htmlFor="assists-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          {hasAssists === "yes" && (
            <>
              <FormField
                control={form.control}
                name="primaryAssistJersey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Assist Jersey Number (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter jersey number" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePrimaryAssistChange(e);
                        }} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryAssistJersey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Assist Jersey Number (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter jersey number" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleSecondaryAssistChange(e);
                        }} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}
          
          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </Form>
    </div>
  );
}
