import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Bot, FileText, Phone, ExternalLink } from 'lucide-react';
import { generateResponse, searchSchemes, type ChatMessage } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import UserLayout from '@/components/custom/layout/user-layout';

// Individual government services with working links
const GOVERNMENT_SERVICES = [
  {
    title: "181 Women Helpline - 24/7 Support",
    description: "National toll-free helpline for women in distress. Provides immediate assistance, counseling, and emergency response coordination.",
    eligibility: "All women and girls in distress",
    link: "https://wcd.nic.in/schemes/women-helpline-scheme",
    category: "Emergency Support",
    icon: "🚨"
  },
  {
    title: "181 Helpline - Emergency Response",
    description: "Immediate police response, medical assistance, and legal support coordination for women facing violence or harassment.",
    eligibility: "Women in emergency situations",
    link: "https://wcd.nic.in/schemes/women-helpline-scheme",
    category: "Emergency Support",
    icon: "🚔"
  },
  {
    title: "181 Helpline - Counseling Services",
    description: "Professional psychological counseling and emotional support for women dealing with domestic violence, harassment, or trauma.",
    eligibility: "Women seeking emotional support",
    link: "https://wcd.nic.in/schemes/women-helpline-scheme",
    category: "Mental Health",
    icon: "💚"
  },
  {
    title: "181 Helpline - Legal Guidance",
    description: "Free legal advice, information about women's rights, and assistance in filing police complaints or legal cases.",
    eligibility: "Women seeking legal assistance",
    link: "https://wcd.nic.in/schemes/women-helpline-scheme",
    category: "Legal Aid",
    icon: "⚖️"
  },
  {
    title: "One Stop Centre - Sakhi",
    description: "Integrated support centers providing medical, legal, psychological, and temporary shelter assistance under one roof.",
    eligibility: "Women affected by violence",
    link: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
    category: "Integrated Support",
    icon: "🏠"
  },
  {
    title: "OSC - Medical Assistance",
    description: "Immediate medical examination, first aid, and referral to hospitals for women victims of violence.",
    eligibility: "Women requiring medical attention",
    link: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
    category: "Healthcare",
    icon: "🏥"
  },
  {
    title: "OSC - Temporary Shelter",
    description: "Safe temporary accommodation for women and their children who need immediate protection from violence.",
    eligibility: "Women needing emergency shelter",
    link: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
    category: "Shelter",
    icon: "🏡"
  },
  {
    title: "Free Legal Services to Women",
    description: "Comprehensive legal aid including court representation, document preparation, and legal counseling for women.",
    eligibility: "All women regardless of financial status",
    link: "https://nalsa.gov.in",
    category: "Legal Aid",
    icon: "⚖️"
  },
  {
    title: "Protection of Women from Domestic Violence Act",
    description: "Legal protection orders, maintenance, custody, and residence rights for women facing domestic violence.",
    eligibility: "Women in domestic violence situations",
    link: "https://wcd.nic.in/acts/protection-women-domestic-violence-act-2005",
    category: "Legal Protection",
    icon: "🛡️"
  },
  {
    title: "Dowry Prohibition Act Support",
    description: "Legal assistance and protection for women facing dowry harassment and related crimes.",
    eligibility: "Women facing dowry-related issues",
    link: "https://wcd.nic.in/acts/dowry-prohibition-act-1961",
    category: "Legal Protection",
    icon: "🚫"
  },
  {
    title: "Beti Bachao Beti Padhao",
    description: "Financial incentives and support for girl child education, health, and overall development.",
    eligibility: "Families with girl children",
    link: "https://wcd.nic.in/schemes/beti-bachao-beti-padhao-bbbp",
    category: "Financial Support",
    icon: "👧"
  },
  {
    title: "Sukanya Samriddhi Yojana",
    description: "Government-backed savings scheme for girl child with high interest rates and tax benefits.",
    eligibility: "Girl children under 10 years",
    link: "https://nsiindia.gov.in/sukanya-samriddhi-yojana",
    category: "Financial Support",
    icon: "💰"
  },
  {
    title: "Pradhan Mantri Matru Vandana Yojana",
    description: "Cash benefit for pregnant and lactating mothers for improved health and nutrition.",
    eligibility: "Pregnant and lactating mothers",
    link: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    category: "Financial Support",
    icon: "🤱"
  },
  {
    title: "Mahila Shakti Kendra",
    description: "Skill development and employment opportunities for rural women through training and support.",
    eligibility: "Rural women seeking employment",
    link: "https://wcd.nic.in/schemes/mahila-shakti-kendra-msk",
    category: "Employment",
    icon: "💼"
  },
  {
    title: "Support to Training and Employment Programme (STEP)",
    description: "Skill development training for women in traditional and non-traditional sectors.",
    eligibility: "Women aged 16 and above",
    link: "https://wcd.nic.in/schemes/support-training-and-employment-programme-women-step",
    category: "Employment",
    icon: "🎓"
  },
  {
    title: "Working Women Hostel",
    description: "Safe and affordable accommodation for working women in urban and semi-urban areas.",
    eligibility: "Working women needing accommodation",
    link: "https://wcd.nic.in/schemes/working-women-hostel-scheme",
    category: "Accommodation",
    icon: "🏢"
  },
  {
    title: "Janani Suraksha Yojana",
    description: "Cash assistance for pregnant women to promote institutional deliveries and reduce maternal mortality.",
    eligibility: "Pregnant women from BPL families",
    link: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308",
    category: "Healthcare",
    icon: "🤰"
  },
  {
    title: "Pradhan Mantri Surakshit Matritva Abhiyan",
    description: "Free antenatal care and high-risk pregnancy management for pregnant women.",
    eligibility: "All pregnant women",
    link: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=842&lid=308",
    category: "Healthcare",
    icon: "🏥"
  },
  {
    title: "Poshan Abhiyan",
    description: "Nutrition support and awareness programs for women and children to combat malnutrition.",
    eligibility: "Women and children",
    link: "https://poshanabhiyaan.gov.in",
    category: "Nutrition",
    icon: "🥗"
  },
  {
    title: "Cyber Crime Against Women",
    description: "Specialized cyber crime units and helplines for women facing online harassment and cyber stalking.",
    eligibility: "Women facing cyber crimes",
    link: "https://cybercrime.gov.in",
    category: "Digital Safety",
    icon: "🖥️"
  },
  {
    title: "Digital Literacy for Women",
    description: "Training programs to help women use technology safely and protect themselves online.",
    eligibility: "Women seeking digital literacy",
    link: "https://digitalindia.gov.in",
    category: "Digital Safety",
    icon: "💻"
  },
  {
    title: "Online Safety Awareness",
    description: "Awareness campaigns and resources about online safety, privacy protection, and reporting mechanisms.",
    eligibility: "All women using digital platforms",
    link: "https://cybercrime.gov.in",
    category: "Digital Safety",
    icon: "🔒"
  }
];

const InfoPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('schemes'); // Set default to schemes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchSchemes(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search schemes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission from refreshing the page
    
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateResponse([...messages, newMessage]);
      if (response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response,
        }]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      let errorMessage = 'Failed to get response. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'API key not configured. Please check environment setup.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'API quota exceeded. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Message Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with system message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'system',
        content: 'Hello! I am your AI assistant. I can help you with information about government schemes and women\'s safety programs. I have detailed information about the 181 Women Helpline, One Stop Centres, legal aid, financial support schemes, and digital safety resources. The 181 helpline is a 24/7 toll-free service for women in distress providing emergency response, counseling, and legal guidance. What would you like to know about these services?'
      }]);
    }
  }, []);

  return (
    <UserLayout>
      <div className="space-y-4 pb-16 md:pb-0"> {/* Added padding bottom for mobile nav */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
            <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="schemes" className="space-y-4 mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search government services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('All')}
                >
                  All Services
                </Button>
                {Array.from(new Set(GOVERNMENT_SERVICES.map(service => service.category))).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {searchResults ? (
              <Card>
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap text-sm">{searchResults}</pre>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GOVERNMENT_SERVICES
                  .filter(service => 
                    selectedCategory === 'All' || service.category === selectedCategory
                  )
                  .filter(service =>
                    searchQuery === '' || 
                    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    service.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((service) => (
                    <Card key={service.title} className="h-full hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{service.icon}</span>
                          {service.title}
                        </CardTitle>
                        <Badge variant="outline" className="w-fit">
                          {service.category}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            {service.eligibility}
                          </Badge>
                          <div className="flex justify-between items-center">
                            <a
                              href={service.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              onClick={(e) => {
                                // Test if link is accessible
                                e.preventDefault();
                                window.open(service.link, '_blank', 'noopener,noreferrer');
                              }}
                            >
                              Learn More
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <Phone className="w-4 h-4 text-green-500" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 mt-4">
            <Card className="h-[calc(100vh-12rem)] md:h-[600px] flex flex-col"> {/* Adjusted height for mobile */}
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-3 md:p-6"> {/* Adjusted padding for mobile */}
                <ScrollArea className="flex-1 pr-4" ref={chatContainerRef}>
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'assistant' || message.role === 'system'
                            ? 'justify-start'
                            : 'justify-end'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            message.role === 'assistant' || message.role === 'system'
                              ? 'bg-secondary'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-lg p-3 bg-secondary">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <form
                  ref={formRef}
                  onSubmit={handleSendMessage}
                  className="flex gap-2 mt-4 sticky bottom-0 bg-background"
                >
                  <Input
                    placeholder="Ask about government schemes..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || !inputMessage.trim()}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserLayout>
  );
};

export default InfoPage; 