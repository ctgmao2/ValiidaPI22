import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  addDays, 
  format, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  parseISO,
  isWithinInterval 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Task } from '@/lib/types';

export function CalendarView() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Generate an array of days for the week view
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return addDays(weekStart, i);
  });

  // Format the date range for display
  const dateRangeText = `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`;

  // Filter tasks for the selected date
  const getTasksForDate = (date: Date) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
  };

  // Handle date selection from calendar popover
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentWeek(date);
      setPopoverOpen(false);
    }
  };

  // Get tasks that fall within the displayed week
  const getTasksForWeek = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = parseISO(task.dueDate);
      return isWithinInterval(taskDate, { start, end });
    });
  };
  
  // Count tasks for a specific date
  const getTaskCountForDate = (date: Date) => {
    return getTasksForDate(date).length;
  };

  // Determine if a date has tasks
  const hasTasksForDate = (date: Date) => {
    return getTaskCountForDate(date) > 0;
  };

  // Render task items for the selected date
  const renderTasksForDate = () => {
    if (!selectedDate) return null;
    
    const dateTasks = getTasksForDate(selectedDate);
    
    if (dateTasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks scheduled for this day</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {dateTasks.map((task: Task) => (
          <div 
            key={task.id} 
            className="p-3 border rounded-lg bg-card hover:bg-accent transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description || 'No description'}
                </p>
              </div>
              <Badge variant={
                task.status === 'completed' ? 'default' : 
                task.status === 'in-progress' ? 'secondary' : 
                'outline'
              }>
                {task.status || 'not-started'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={goToToday}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={goToNextWeek}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next week</span>
          </Button>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="ml-auto"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRangeText}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-sm text-muted-foreground">
          {getTasksForWeek().length} tasks this week
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div 
            key={day.toString()}
            className="text-center"
          >
            <div className="text-sm font-medium mb-1">
              {format(day, 'EEE')}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {format(day, 'MMM d')}
            </div>
            <button
              className={cn(
                "h-16 w-full rounded-md border border-border hover:bg-accent/50 transition-colors",
                isSameDay(day, new Date()) && "border-primary",
                selectedDate && isSameDay(day, selectedDate) && "bg-accent",
              )}
              onClick={() => setSelectedDate(day)}
            >
              <div className="flex flex-col items-center justify-center h-full">
                {hasTasksForDate(day) ? (
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                    {getTaskCountForDate(day)}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">No tasks</span>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
        </h3>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : renderTasksForDate()}
      </div>
    </div>
  );
}