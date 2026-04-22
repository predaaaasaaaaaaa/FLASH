import { ASTParser } from '../src/parser';

describe('ASTParser Multi-Language', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = new ASTParser();
  });

  it('should parse Python definitions', () => {
    parser.setLanguageByExtension('.py');
    const code = `
class MyService:
    def process_data(self):
        pass
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('MyService');
    expect(names).toContain('process_data');
  });

  it('should parse Go definitions', () => {
    parser.setLanguageByExtension('.go');
    const code = `
type Handler struct {}
func (h *Handler) ServeHTTP() {}
func main() {}
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('Handler');
    expect(names).toContain('ServeHTTP');
    expect(names).toContain('main');
  });

  it('should parse Rust definitions', () => {
    parser.setLanguageByExtension('.rs');
    const code = `
struct Engine {}
impl Engine {
    fn execute() {}
}
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('Engine');
    expect(names).toContain('execute'); // It might capture the impl block too, but let's just assert execute
  });

  it('should parse Java definitions', () => {
    parser.setLanguageByExtension('.java');
    const code = `
public class MainController {
    public void handleRequest() {}
}
    `;
    const names = parser.extractFunctionNames(code);
    expect(names).toContain('MainController');
    expect(names).toContain('handleRequest');
  });
});