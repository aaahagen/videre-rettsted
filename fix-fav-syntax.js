const fs = require('fs');

let code = fs.readFileSync('src/app/dashboard/favorites/page.tsx', 'utf8');

const badCode = `                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

                    </div>
                  </CardContent>
                </Card>
              </div>
            )}`;

const fixedCode = `                    </div>
                  </CardContent>
                </Card>
              </div>
            )}`;

code = code.replace(badCode, fixedCode);

fs.writeFileSync('src/app/dashboard/favorites/page.tsx', code);
