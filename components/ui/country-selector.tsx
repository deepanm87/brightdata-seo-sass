"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from "lucide-react"
import { countries } from "@/data/countries"

interface CountrySelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CountrySelector({
  value,
  onValueChange,
  disabled
}: CountrySelectorProps) {
  const selectedCountry = countries.find(country => country.code === value) || countries[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-14 px-4 justify-between min-w-[140px] border-2 border-blue-200 dark:border-blue-800 hover:border-blue-500
            dark:hover:border-blue-400 bg-white/80 dark:bg-gray-900/80 backdrop-blue-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="font-medium">{selectedCountry.code}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[280px] max-h-[300px] overflow-y-auto"
      >
        { countries.map(country => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => onValueChange(country.code)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span className="text-lg">{country.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{country.name}</span>
              <span className="text-xs text-muted-foreground">{country.code}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}