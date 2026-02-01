import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class AppConfigService {
	constructor(private configurationService: ConfigService) {}

	get name(): string | undefined {
		return this.configurationService.get<string>('appConfig.name');
	}

	get env(): string | undefined {
		return this.configurationService.get<string>('appConfig.env');
	}

	get port(): number {
		return Number(this.configurationService.get<number>('appConfig.port'));
	}

	get host(): string | undefined {
		return this.configurationService.get<string>('appConfig.host')
	}

	get url(): string | undefined {
		return this.configurationService.get<string>('appConfig.url')
	}

	get student_url(): string | undefined {
		return this.configurationService.get<string>('appConfig.client_url')
	}
}