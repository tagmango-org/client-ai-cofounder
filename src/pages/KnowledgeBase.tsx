
import { useState, useEffect } from 'react';
import { KnowledgeArticle as KnowledgeArticleEntity } from '@/api/entities';
import type { 
  KnowledgeArticle, 
  ArticleFormData, 
  UploadedFile,
  FormChangeHandler,
  FileChangeHandler,
  SubmitHandler,
  ArticleHandler
} from '@/types/knowledgeBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, BookOpen, Upload, FileText, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';

export default function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentArticle, setCurrentArticle] = useState<KnowledgeArticle | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({ title: '', content: '', category: '', keywords: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string>('');

  const fetchArticles = async (): Promise<void> => {
    setIsLoading(true);
    const fetchedArticles = await KnowledgeArticleEntity.list('-created_date');
    setArticles(fetchedArticles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleAddNew = () => {
    setCurrentArticle(null);
    setFormData({ title: '', content: '', category: '', keywords: '' });
    setUploadedFile(null);
    setUploadStatusMessage('');
    setIsUploading(false); // Reset upload state
    setIsDialogOpen(true);
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setFormData({ ...article, keywords: article.keywords.join(', ') });
    setUploadedFile(null);
    setUploadStatusMessage('');
    setIsUploading(false); // Reset upload state
    setIsDialogOpen(true);
  };

  const handleDelete = async (articleId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await KnowledgeArticleEntity.delete(articleId);
      fetchArticles();
    }
  };

  const handleFormChange: FormChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload: FileChangeHandler = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      event.target.value = ''; // Clear the input
      return;
    }

    // Add file size check (10MB limit)
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
        alert('File is too large. Please upload a PDF under 10MB.');
        event.target.value = ''; // Clear the input
        return;
    }

    setIsUploading(true);
    try {
      setUploadStatusMessage('Uploading your file...');
      const { file_url } = await UploadFile({ file });
      
      setUploadStatusMessage('File uploaded. Extracting text...');
      const jsonSchema = {
        type: "object",
        properties: {
          full_text: {
            type: "string",
            description: "The complete text content extracted from the PDF"
          }
        },
        required: ["full_text"]
      };

      const extractResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: jsonSchema
      });

      if (extractResult.status === 'success' && extractResult.output) {
        setFormData(prev => ({
          ...prev,
          content: extractResult.output.full_text
        }));
        setUploadedFile(file.name);
        setUploadStatusMessage(''); // Clear on success
      } else {
        alert('Failed to extract content from PDF. Please try again or enter content manually.');
        setUploadStatusMessage('Extraction failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF file. Please try again.');
      setUploadStatusMessage('An error occurred during processing.');
    } finally {
      setIsUploading(false);
      event.target.value = ''; // Clear the input
    }
  };

  const handleSubmit: SubmitHandler = async (e) => {
    e.preventDefault();
    const keywordsArray = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const articleData = { ...formData, keywords: keywordsArray };

    if (currentArticle) {
      await KnowledgeArticleEntity.update(currentArticle.id, articleData);
    } else {
      await KnowledgeArticleEntity.create(articleData);
    }
    fetchArticles();
    setIsDialogOpen(false);
    // Reset all upload states when dialog closes
    setUploadedFile(null);
    setUploadStatusMessage('');
    setIsUploading(false);
  };

  const handleDialogClose = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset all upload states when dialog is closed
      setUploadedFile(null);
      setUploadStatusMessage('');
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Knowledge Base</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          <span>Add New Article</span>
        </Button>
      </div>
      <p className="text-gray-600 mb-8">
        Manage the knowledge articles that your AI Growth Coach uses to provide expert advice.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading articles...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new knowledge article.</p>
            <div className="mt-6">
                <Button onClick={handleAddNew}>
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                    New Article
                </Button>
            </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <Card key={article.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{article.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 line-clamp-3">{article.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.keywords.slice(0, 3).map(kw => (
                    <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                  ))}
                  {article.keywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{article.keywords.length - 3} more</Badge>
                  )}
                </div>
              </CardContent>
              <div className="p-4 border-t flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(article)}>
                  <Edit className="w-4 h-4 mr-2" />Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentArticle ? 'Edit Article' : 'Add New Article'}</DialogTitle>
            <DialogDescription>
              Fill in the details below or upload a PDF to automatically extract content. Keywords help the AI find relevant information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* PDF Upload Section */}
            {!currentArticle && (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Upload PDF to extract content</span>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">The content will be extracted and filled in the form below</p>
                  
                  {isUploading && (
                    <div className="flex items-center justify-center mt-3">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">{uploadStatusMessage}</span>
                    </div>
                  )}
                  
                  {uploadedFile && !isUploading && (
                    <div className="flex items-center justify-center mt-3 text-green-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="text-sm">Content extracted from: {uploadedFile}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Input 
              name="title" 
              placeholder="Article Title" 
              value={formData.title} 
              onChange={handleFormChange} 
              required 
            />
            <Input 
              name="category" 
              placeholder="Category (e.g., Course Creation, Marketing)" 
              value={formData.category} 
              onChange={handleFormChange} 
              required 
            />
            <Textarea 
              name="content" 
              placeholder="Article Content (or upload a PDF above to auto-fill)" 
              value={formData.content} 
              onChange={handleFormChange} 
              required 
              rows={10}
              className="min-h-[200px]"
            />
            <Input 
              name="keywords" 
              placeholder="Keywords (comma-separated, e.g., course, module, create, upload)" 
              value={formData.keywords} 
              onChange={handleFormChange} 
              required 
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {currentArticle ? 'Save Changes' : 'Create Article'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
