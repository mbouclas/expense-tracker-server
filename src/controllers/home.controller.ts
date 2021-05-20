import {Controller, Get} from "routing-controllers";
import {Service} from "typedi";

@Controller('/')
@Service()
export class HomeController {
    @Get('')
    async home() {
        return 'Somebody took a wrong turn'
    }
}
