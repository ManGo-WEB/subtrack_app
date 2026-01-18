"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ServiceCatalog } from "@/types/service";

interface ServiceComboboxProps {
  services: ServiceCatalog[];
  value?: number | null;
  onValueChange: (serviceId: number | null, service: ServiceCatalog | null) => void;
  onCustomService?: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ServiceCombobox({
  services,
  value,
  onValueChange,
  onCustomService,
  placeholder = "Выберите сервис...",
  disabled = false,
}: ServiceComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedService = React.useMemo(
    () => services.find((service) => service.id === value) || null,
    [services, value]
  );

  const filteredServices = React.useMemo(() => {
    if (!searchQuery.trim()) return services;
    return services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  const handleServiceSelect = (service: ServiceCatalog) => {
    onValueChange(service.id, service);
    setOpen(false);
    setSearchQuery("");
  };

  const handleCustomCreate = () => {
    if (searchQuery.trim() && onCustomService) {
      onCustomService(searchQuery.trim());
      setOpen(false);
      setSearchQuery("");
    }
  };

  // Обработчик для предотвращения скролла страницы при скролле внутри списка
  const handleScrollContainerTouchStart = (e: React.TouchEvent) => {
    // Предотвращаем всплытие события, чтобы не скроллилась страница
    e.stopPropagation();
  };

  const handleScrollContainerTouchMove = (e: React.TouchEvent) => {
    // Предотвращаем всплытие события, чтобы не скроллилась страница
    e.stopPropagation();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedService ? (
            <span>{selectedService.name}</span>
          ) : searchQuery ? (
            <span className="text-muted-foreground">{searchQuery}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Поиск сервиса..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div 
            className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
            onTouchStart={handleScrollContainerTouchStart}
            onTouchMove={handleScrollContainerTouchMove}
          >
            {filteredServices.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchQuery ? (
                  <div className="py-2 px-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Сервис "{searchQuery}" не найден
                    </div>
                    {onCustomService && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCustomCreate}
                        className="w-full"
                      >
                        Создать "{searchQuery}"
                      </Button>
                    )}
                  </div>
                ) : (
                  <span>Сервисы не найдены</span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      value === service.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === service.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {service.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
