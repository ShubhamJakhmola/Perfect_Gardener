import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/BackToTop";
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
import { useToast } from "@/hooks/use-toast";
import { findBestMatch } from "@/lib/search-utils";
import { plantsAPI } from "@/lib/api-client";
import { SEO } from "@/components/SEO";

interface PlantData {
  name: string;
  Region: string;
  "Growing Months": string;
  Season: string;
  "Soil Requirements": string;
  "Bloom and Harvest Time": string;
  "Sunlight Needs": string;
  "Care Instructions": string;
  Image?: string;
}

interface PlantsDatabase {
  Plants: PlantData[];
}

// Original bloom data from the source
const bloomData: Record<string, { daysToGermination: number; daysToMaturity: number; bloomDuration: number; care: string[] }> = {
  'Marigold': {
    daysToGermination: 5,
    daysToMaturity: 50,
    bloomDuration: 90,
    care: ['Water regularly but not overwater', 'Full sun (6-8 hours daily)', 'Deadhead spent flowers', 'Well-drained soil essential']
  },
  'Rose': {
    daysToGermination: 10,
    daysToMaturity: 60,
    bloomDuration: 180,
    care: ['Requires deep watering', 'Morning sun essential', 'Regular pruning for bushier growth', 'Use rose fertilizer monthly']
  },
  'Zinnia': {
    daysToGermination: 7,
    daysToMaturity: 45,
    bloomDuration: 100,
    care: ['Water at soil level, not on leaves', 'Full sun required', 'Deadhead regularly', 'Pinch tips for bushier plants']
  },
  'Sunflower': {
    daysToGermination: 7,
    daysToMaturity: 60,
    bloomDuration: 70,
    care: ['Plant near support structure', 'Water deeply but less frequently', 'Full sun (8+ hours)', 'Tall varieties need staking']
  },
  'Dahlia': {
    daysToGermination: 14,
    daysToMaturity: 70,
    bloomDuration: 120,
    care: ['Plant tubers 6 inches deep', 'Stake early for support', 'Regular deadheading extends blooms', 'Fertilize every 2 weeks']
  },
  'Cosmos': {
    daysToGermination: 8,
    daysToMaturity: 55,
    bloomDuration: 90,
    care: ['Drought tolerant once established', 'Full sun', 'Minimal fertilizer needed', 'Deadhead for continuous blooms']
  },
  'Petunia': {
    daysToGermination: 10,
    daysToMaturity: 50,
    bloomDuration: 110,
    care: ['Regular watering essential', 'Full sun to partial shade', 'Deadhead weekly', 'Pinch for compact growth']
  },
  'Chrysanthemum': {
    daysToGermination: 12,
    daysToMaturity: 75,
    bloomDuration: 80,
    care: ['Full sun preferred', 'Keep soil moist', 'Pinch tips in summer', 'Fertilize every 2 weeks']
  },
  'Jasmine': {
    daysToGermination: 15,
    daysToMaturity: 90,
    bloomDuration: 150,
    care: ['Climbing variety - provide support', 'Partial sun', 'Regular watering during growing season', 'Fragrant flowers']
  },
  'Bougainvillea': {
    daysToGermination: 20,
    daysToMaturity: 120,
    bloomDuration: 180,
    care: ['Extremely drought tolerant', 'Full sun mandatory', 'Prune after flowering', 'Well-drained soil essential']
  },
  'Gladiolus': {
    daysToGermination: 10,
    daysToMaturity: 65,
    bloomDuration: 70,
    care: ['Plant corms 4 inches deep', 'Stake tall varieties', 'Plant succession for continuous blooms', 'Cut when first flower opens']
  },
  'Tulip': {
    daysToGermination: 14,
    daysToMaturity: 90,
    bloomDuration: 50,
    care: ['Chill bulbs before planting in warm climates', 'Full sun', 'Well-drained soil', 'Remove spent flowers']
  },
  'Pansy': {
    daysToGermination: 10,
    daysToMaturity: 60,
    bloomDuration: 120,
    care: ['Cool weather preferred', 'Partial shade in hot climate', 'Keep soil moist', 'Regular deadheading']
  },
  'Dianthus': {
    daysToGermination: 8,
    daysToMaturity: 50,
    bloomDuration: 90,
    care: ['Full sun required', 'Well-drained soil essential', 'Deadhead for extended bloom', 'Drought tolerant once established']
  },
  'Snapdragon': {
    daysToGermination: 10,
    daysToMaturity: 70,
    bloomDuration: 100,
    care: ['Full sun to partial shade', 'Keep soil consistently moist', 'Stake if needed', 'Pinch tips early for bushy growth']
  }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const flowerOptions = [
  { value: 'Marigold', label: 'Marigold (Genda)' },
  { value: 'Rose', label: 'Rose' },
  { value: 'Zinnia', label: 'Zinnia' },
  { value: 'Sunflower', label: 'Sunflower' },
  { value: 'Dahlia', label: 'Dahlia' },
  { value: 'Cosmos', label: 'Cosmos' },
  { value: 'Petunia', label: 'Petunia' },
  { value: 'Chrysanthemum', label: 'Chrysanthemum' },
  { value: 'Jasmine', label: 'Jasmine' },
  { value: 'Bougainvillea', label: 'Bougainvillea' },
  { value: 'Gladiolus', label: 'Gladiolus' },
  { value: 'Tulip', label: 'Tulip' },
  { value: 'Pansy', label: 'Pansy' },
  { value: 'Dianthus', label: 'Dianthus' },
  { value: 'Snapdragon', label: 'Snapdragon' },
  { value: 'Other', label: 'Other (Plant)' },
];

interface BloomResult {
  flowerName: string;
  sowingMonth: string;
  bloomMonth: string;
  endMonth: string;
  totalDays: number;
  data: typeof bloomData[string];
}

// Original addMonths function
function addMonths(monthName: string, monthsToAdd: number): string {
  const index = months.indexOf(monthName);
  return months[(index + monthsToAdd) % 12];
}

const BloomCalculator = () => {
  const { toast } = useToast();
  const [flowerName, setFlowerName] = useState("");
  const [customFlowerName, setCustomFlowerName] = useState("");
  const [sowingMonth, setSowingMonth] = useState("");
  const [result, setResult] = useState<BloomResult | null>(null);
  const [plantsDatabase, setPlantsDatabase] = useState<PlantData[]>([]);
  const [dbPlants, setDbPlants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Load PlantsDatabase.json (Local/Hardcoded Data - Tier 1)
  useEffect(() => {
    const loadPlantsDatabase = async () => {
      try {
        const response = await fetch("/assets/Data/PlantsDatabase.json");
        const data: PlantsDatabase = await response.json();
        setPlantsDatabase(data.Plants || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load plants database:", error);
        setIsLoading(false);
        toast({
          title: "Warning",
          description: "Could not load local plants database. Will use database and AI fallback.",
          variant: "destructive",
        });
      }
    };
    loadPlantsDatabase();
  }, [toast]);

  // Load plants from Neon DB (Tier 2)
  useEffect(() => {
    const loadDbPlants = async () => {
      try {
        const plants = await plantsAPI.getAll();
        setDbPlants(plants || []);
      } catch (error) {
        console.error("Failed to load plants from database:", error);
        // Don't show error toast, just log it - DB is optional fallback
      }
    };
    loadDbPlants();
  }, []);

  // Find plant in local database (Tier 1 - Local/Hardcoded Data)
  const findPlantInLocalDatabase = (searchName: string): { plant: PlantData | null; suggestedName?: string } => {
    const normalizedSearch = searchName.toLowerCase().trim();
    
    if (!normalizedSearch) {
      return { plant: null };
    }
    
    // Exact match first
    let found = plantsDatabase.find(
      (p) => p.name.toLowerCase() === normalizedSearch
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Partial match if no exact match
    found = plantsDatabase.find(
      (p) => p.name.toLowerCase().includes(normalizedSearch) || 
             normalizedSearch.includes(p.name.toLowerCase())
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Try fuzzy matching using search-utils
    const allPlantNames = plantsDatabase.map(p => p.name);
    const { match: bestMatch } = findBestMatch(searchName, allPlantNames, 0.5);
    
    if (bestMatch) {
      const matchedPlant = plantsDatabase.find(p => p.name === bestMatch);
      if (matchedPlant) {
        return { plant: matchedPlant, suggestedName: bestMatch };
      }
    }
    
    return { plant: null };
  };

  // Find plant in Neon DB (Tier 2 - Database)
  const findPlantInDb = (searchName: string): { plant: any | null; suggestedName?: string } => {
    const normalizedSearch = searchName.toLowerCase().trim();
    
    if (!normalizedSearch || dbPlants.length === 0) {
      return { plant: null };
    }
    
    // Exact match first
    let found = dbPlants.find(
      (p) => p.name.toLowerCase() === normalizedSearch
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Partial match if no exact match
    found = dbPlants.find(
      (p) => p.name.toLowerCase().includes(normalizedSearch) || 
             normalizedSearch.includes(p.name.toLowerCase())
    );
    
    if (found) {
      return { plant: found };
    }
    
    // Try fuzzy matching
    const allPlantNames = dbPlants.map(p => p.name);
    const { match: bestMatch } = findBestMatch(searchName, allPlantNames, 0.5);
    
    if (bestMatch) {
      const matchedPlant = dbPlants.find(p => p.name === bestMatch);
      if (matchedPlant) {
        return { plant: matchedPlant, suggestedName: bestMatch };
      }
    }
    
    return { plant: null };
  };

  // Convert DB plant to PlantData format
  const convertDbPlantToPlantData = (dbPlant: any): PlantData => {
    return {
      name: dbPlant.name,
      Region: dbPlant.region || '',
      "Growing Months": dbPlant.growing_months || '',
      Season: dbPlant.season || '',
      "Soil Requirements": dbPlant.soil_requirements || '',
      "Bloom and Harvest Time": dbPlant.bloom_harvest_time || '',
      "Sunlight Needs": dbPlant.sunlight_needs || '',
      "Care Instructions": dbPlant.care_instructions || '',
      Image: dbPlant.image || '',
    };
  };

  // Convert plant data to bloom data format
  const convertPlantToBloomData = (plant: PlantData) => {
    // Estimate days based on growing months and bloom time
    const growingMonths = plant["Growing Months"].split(",").map(m => m.trim()).length;
    const estimatedDaysToMaturity = growingMonths * 30;
    const estimatedDaysToGermination = 7; // Default
    const estimatedBloomDuration = 60; // Default 2 months
    
    // Parse care instructions
    const careInstructions = plant["Care Instructions"]
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);
    
    return {
      daysToGermination: estimatedDaysToGermination,
      daysToMaturity: estimatedDaysToMaturity,
      bloomDuration: estimatedBloomDuration,
      care: careInstructions.length > 0 ? careInstructions : [
        `Region: ${plant.Region}`,
        `Season: ${plant.Season}`,
        `Sunlight: ${plant["Sunlight Needs"]}`,
        `Soil: ${plant["Soil Requirements"]}`,
      ],
    };
  };

  // Update flower options to include popular plants from database
  const getPopularPlants = () => {
    if (plantsDatabase.length === 0 && dbPlants.length === 0) return flowerOptions;
    
    const popularNames = [
      "Rose", "Marigold", "Sunflower", "Tulip", "Jasmine", 
      "Tomato", "Chili", "Brinjal", "Okra", "Cucumber",
      "Mango", "Banana", "Papaya", "Guava", "Lemon"
    ];
    
    // Check both local and DB plants
    const foundPlants = popularNames
      .map(name => {
        const localResult = findPlantInLocalDatabase(name);
        if (localResult.plant) return localResult;
        const dbResult = findPlantInDb(name);
        if (dbResult.plant) {
          return { plant: convertDbPlantToPlantData(dbResult.plant), suggestedName: dbResult.suggestedName };
        }
        return { plant: null };
      })
      .filter(result => result.plant !== null)
      .map(result => ({ value: result.plant!.name, label: result.plant!.name }));
    
    return [
      ...foundPlants.slice(0, 10),
      ...flowerOptions.filter(opt => opt.value !== "Other"),
      { value: "Other", label: "Other (Type plant name)" },
    ];
  };

  const calculateBloomTime = async () => {
    let selectedFlower = flowerName;

    if (!selectedFlower || !sowingMonth) {
      toast({
        title: "Missing Information",
        description: "Please select both plant and sowing month",
        variant: "destructive",
      });
      return;
    }

    if (selectedFlower === "Other") {
      if (!customFlowerName.trim()) {
        toast({
          title: "Missing Plant Name",
          description: "Please enter a plant, fruit, or vegetable name",
          variant: "destructive",
        });
        return;
      }
      selectedFlower = customFlowerName.trim();
    }

    // Reset result when changing plant
    setResult(null);
    setAiResponse(null);

    let data;
    let displayName = selectedFlower;
    let dataSource = '';

    // TIER 1: Try local/hardcoded data first
    const { plant: localPlantData, suggestedName: localSuggestedName } = findPlantInLocalDatabase(selectedFlower);
    
    if (localPlantData) {
      // Use local database data
      data = convertPlantToBloomData(localPlantData);
      displayName = localPlantData.name;
      dataSource = 'local';
      
      // Show suggestion if name was corrected
      if (localSuggestedName && localSuggestedName !== selectedFlower) {
        toast({
          title: "Plant Found (Local Data)",
          description: `Did you mean "${localSuggestedName}"? Using that instead.`,
        });
      }
    } else {
      // Check hardcoded bloomData
      const normalizedName = selectedFlower.charAt(0).toUpperCase() + selectedFlower.slice(1).toLowerCase();
      const fallbackData = bloomData[normalizedName];
      
      if (fallbackData) {
        data = fallbackData;
        displayName = normalizedName;
        dataSource = 'hardcoded';
      } else {
        // TIER 2: Try Neon DB plants table
        const { plant: dbPlantData, suggestedName: dbSuggestedName } = findPlantInDb(selectedFlower);
        
        if (dbPlantData) {
          // Convert DB plant to PlantData format and then to bloom data
          const plantData = convertDbPlantToPlantData(dbPlantData);
          data = convertPlantToBloomData(plantData);
          displayName = dbPlantData.name;
          dataSource = 'database';
          
          if (dbSuggestedName && dbSuggestedName !== selectedFlower) {
            toast({
              title: "Plant Found (Database)",
              description: `Found in database. Did you mean "${dbSuggestedName}"?`,
            });
          } else {
            toast({
              title: "Plant Found (Database)",
              description: "Found plant information in our database.",
            });
          }
        } else {
          // TIER 3: Fallback to AI
          setIsLoadingAI(true);
          setAiResponse(null);
          
          try {
            const aiResponse = await fetch('/.netlify/functions/plant-ai-fallback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                plantName: selectedFlower,
                query: `bloom time and timeline for ${selectedFlower}`,
                context: `User is asking about bloom timeline for ${selectedFlower} planted in ${sowingMonth}`
              })
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              if (aiData.success && aiData.response) {
                setAiResponse(aiData.response);
                dataSource = 'ai';
                
                // Use generic bloom data with AI response
                data = {
                  daysToGermination: 10,
                  daysToMaturity: 60,
                  bloomDuration: 90,
                  care: ['Follow general plant care guidelines', 'Refer to AI response for specific details']
                };
                
                toast({
                  title: "AI Information Available",
                  description: "Using AI-generated information for this plant. Check the results below.",
                });
              } else {
                throw new Error('AI response not available');
              }
            } else {
              throw new Error('AI service unavailable');
            }
          } catch (error) {
            console.error('AI fallback error:', error);
            setIsLoadingAI(false);
            
            // Show error if all tiers failed
            const suggestionText = dbSuggestedName 
              ? ` Did you mean "${dbSuggestedName}"?`
              : localSuggestedName
              ? ` Did you mean "${localSuggestedName}"?`
              : "";
            toast({
              title: "Plant Not Found",
              description: `Data for "${selectedFlower}" is not available in our databases, and AI service is unavailable.${suggestionText} Please try a different name.`,
              variant: "destructive",
            });
            return;
          }
          
          setIsLoadingAI(false);
        }
      }
    }

    // Timeline calculation
    const totalDays = data.daysToGermination + data.daysToMaturity;
    const monthsToBloom = Math.ceil(totalDays / 30);
    const bloomMonth = addMonths(sowingMonth, monthsToBloom);
    const endMonth = addMonths(bloomMonth, Math.ceil(data.bloomDuration / 30));

    setResult({
      flowerName: displayName,
      sowingMonth,
      bloomMonth,
      endMonth,
      totalDays,
      data,
    });
  };

  const resetForm = () => {
    setFlowerName("");
    setCustomFlowerName("");
    setSowingMonth("");
    setResult(null);
    setAiResponse(null);
    setIsLoadingAI(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Flower Bloom Time Calculator"
        description="Calculate when your flowers will bloom based on planting time and flower type. Free online tool to predict bloom timeline for marigold, rose, sunflower, and more. Perfect for planning your garden."
        keywords="bloom time calculator, flower bloom calculator, when do flowers bloom, flower planting calendar, bloom timeline, flower growth calculator, gardening calculator, plant bloom time"
        url="https://perfectgardener.netlify.app/tools/bloom-calculator"
      />
      <Header />
      
      <main id="main-content" className="pt-20">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Link 
            to="/tools" 
            className="inline-flex items-center text-primary hover:underline mb-6 font-medium"
          >
            ← Back to Tools Hub
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              🌺 Flower Bloom Time Calculator
            </h1>
            <p className="text-muted-foreground">
              Predict when your flowers will bloom based on variety and sowing time.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="flowerName">Select Plant (Flower/Vegetable/Fruit):</Label>
                <Select value={flowerName} onValueChange={(val) => {
                  setFlowerName(val);
                  setResult(null); // Reset result when changing selection
                  if (val !== "Other") {
                    setCustomFlowerName("");
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Plant --" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>Loading plants...</SelectItem>
                    ) : (
                      getPopularPlants().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {flowerName === "Other" && (
                  <Input
                    type="text"
                    placeholder="Enter plant, vegetable, or fruit name (e.g., Tomato, Mango, Rose)"
                    value={customFlowerName}
                    onChange={(e) => {
                      setCustomFlowerName(e.target.value);
                      setResult(null); // Reset result when typing
                    }}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sowingMonth">Sowing Month:</Label>
                <Select value={sowingMonth} onValueChange={(val) => {
                  setSowingMonth(val);
                  setResult(null); // Reset result when changing month
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Select Month --" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Button onClick={calculateBloomTime} disabled={isLoadingAI} className="flex-1 sm:flex-none">
                {isLoadingAI ? "Loading AI Info..." : "Calculate Bloom Time"}
              </Button>
              <Button onClick={resetForm} variant="secondary" className="flex-1 sm:flex-none">
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-primary mb-4">
                🌺 {result.flowerName} Bloom Timeline
              </h2>

              <h3 className="font-semibold text-foreground mb-4">📅 Bloom Timeline</h3>

              <div className="bg-primary/5 rounded-lg p-4 space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <strong className="text-primary block">Sowing Month</strong>
                    <span className="text-muted-foreground text-sm">{result.sowingMonth}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <strong className="text-primary block">Germination</strong>
                    <span className="text-muted-foreground text-sm">{result.data.daysToGermination} days</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🌸</span>
                  <div>
                    <strong className="text-primary block">Bloom Start</strong>
                    <span className="text-muted-foreground text-sm">{result.bloomMonth} (~{result.totalDays} days)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">💐</span>
                  <div>
                    <strong className="text-primary block">Bloom Duration</strong>
                    <span className="text-muted-foreground text-sm">{result.data.bloomDuration} days</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <span className="text-2xl">🍂</span>
                  <div>
                    <strong className="text-primary block">Bloom End</strong>
                    <span className="text-muted-foreground text-sm">Around {result.endMonth}</span>
                  </div>
                </div>
              </div>

              {/* Care Tips */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-3">🌿 Essential Care Tips</h4>
                <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
                  {result.data.care.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* AI Response Section */}
              {aiResponse && (
                <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span>🤖</span> AI Information
                  </h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              )}

              {isLoadingAI && (
                <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    🤖 Fetching AI information about this plant...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default BloomCalculator;
