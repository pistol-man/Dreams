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

// Sample government schemes data (replace with real data)
const SCHEMES = [
  {
    category: "Legal Aid",
    schemes: [
      {
        title: "Free Legal Services to Women",
        description: "Legal aid and counseling services for women in need",
        eligibility: "All women regardless of financial status",
        link: "https://nalsa.gov.in"
      },
      // Add more schemes...
    ]
  },
  {
    category: "Safety & Protection",
    schemes: [
      {
        title: "One Stop Centre Scheme",
        description: "Integrated support for women affected by violence",
        eligibility: "Women affected by violence",
        link: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1"
      },
      // Add more schemes...
    ]
  },
  // Add more categories...
];

const InfoPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('schemes'); // Set default to schemes
  const [searchQuery, setSearchQuery] = useState('');
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
        content: 'Hello! I am your AI assistant. I can help you with information about government schemes and women\'s safety programs. What would you like to know?'
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
            <div className="flex gap-2">
              <Input
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {searchResults ? (
              <Card>
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap text-sm">{searchResults}</pre>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SCHEMES.map((category) => (
                  <Card key={category.category} className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.schemes.map((scheme) => (
                        <div key={scheme.title} className="space-y-2">
                          <h3 className="font-medium flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            {scheme.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{scheme.description}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {scheme.eligibility}
                            </Badge>
                            <a
                              href={scheme.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                              Learn More
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
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