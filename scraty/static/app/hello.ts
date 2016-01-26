/// <reference path="jquery.d.ts" />
/// <reference path="knockout.d.ts" />
/// <reference path="jqueryui.d.ts"/>
import {DataService} from './data_service';
import {Story} from './story';
import ko = require('knockout');


class BoardViewModel {
    stories: KnockoutObservableArray<Story>;
    private service: DataService;

    constructor(service: DataService) {
        var arr : Story[] = [];
        this.stories = ko.observableArray(arr);
        this.service = service;

        // WTF: http://stackoverflow.com/questions/12767128/typescript-wrong-context-this
        this.removeStory = <(story: Story) => void> this.removeStory.bind(this);
    }

    removeStory(story: Story) {
        this.stories.remove(story);
        this.service.deleteStory(story);
    }

    addStory(story: Story) {
        this.stories.push(story);
    }
}


export class App {
    start() {
        $(document).ready(function() {
            var service = new DataService();
            var vm = new BoardViewModel(service)
            ko.applyBindings(vm);

            var ws = new WebSocket("ws://localhost:8080/websocket");
            ws.onopen = function() {
                ws.send("Hello, world");
            };
            ws.onmessage = function (evt) {
                var data = JSON.parse(evt.data);
                console.log(data);
                switch (data.action) {
                    case 'added':
                        vm.stories.push(data.object)
                        break;
                    case 'deleted':
                        vm.stories.remove(data.object)
                        break;
                }
            };

            service.getAllStories().done(result => {
                vm.stories(result.stories);
            });

        });
    }
}
