const puppeteer = require('puppeteer');

const fs = require('fs-extra');

const handlebars = require('handlebars');

const path = require('path');

const csv_to_arr_parser = require('csv-array');


main();

async function main() {
    csv_to_arr_parser.parseCSV("input_data.csv", function(data){
       for(let i = 0; i < data.length; i++){
           generateCardPdf(data[i]);
       } 
    });
}

async function generateCardPdf(student){
    console.log("Inside generate pdf");
    try{
        /*
            Instantiates a browser that will convert html to pdf
        */
        const browser = await puppeteer.launch();
        /*
            Opens a new page in instantiated browser
        */
        const page = await browser.newPage();
        /*
            Read HTML template page that has to be converted to PDF
            Pass template name as a parameter that you want ot get read from templates folder
        */
        let student_Card_template = await read_Template("alumni_card");
        /*
            Compile the template with student data
        */
        let compiled_Template = await compile_Template_With_Data(student, student_Card_template);
        /* 
            Set the page to HTML content
        */
        await page.setContent(compiled_Template);
        /*
            Set media emulator to screen so the output is not like print buffer
        */
        await page.emulateMedia('screen');
        /*
            Set custom pdf name for each student
        */
        let studentPdfName = student.sno + ".pdf";
        /*
                Customize your pdf page with extra options
        */
        await page.pdf({
            path: 'cards/' + studentPdfName,
            format: 'A4',
            printBackground: true
        });

        console.log("Pdf generated for");
        /*
                Close the browser
        */
        await browser.close();
        /*
                Kill the process
        */
        process.exit();
    }
    catch(e){
        console.log("Script exited with followings error \n" + e);
    }
}

async function read_Template(templateName){
    /*
        Set file path for the card template
    */
    let filePath =  path.join(process.cwd(), 'Templates', templateName+'.hbs');
    /*
        First read the HTML template into a variable with charset as UTF-*
    */
    let student_Card_Template = await fs.readFile(filePath, 'utf-8');

    return student_Card_Template;
}

async function compile_Template_With_Data(studentData, student_Card_Template){
    /*
        Compile the above template with Handlebars templating engine
    */
    let compiled_Std_Crd_Temp = await handlebars.compile(student_Card_Template);
    /*
            Pass student data to compiled handle bar template.
            The output would be an html page with student data in it
    */
    let compiled_Page_With_Data = compiled_Std_Crd_Temp(studentData);
    
   //Return compiled_Page_With_Data
   return compiled_Page_With_Data;
}


